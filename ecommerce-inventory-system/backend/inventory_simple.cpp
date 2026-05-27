#include <iostream>
#include <string>
#include <vector>
#include <stack>
#include <queue>
#include <algorithm>
#include <map>
#include <ctime>
#include <iomanip>
#include <climits>
#include <cmath>
using namespace std;


//  PART 1 — STRUCTURES


// One item sold in the store
struct Product {
    int    id;
    string name;
    string category;      // "Electronics", "Clothing", "Footwear"
    double basePrice;     // original price; dynamic pricing adjusts 'price'
    double price;         // current (possibly adjusted) price
    int    popularity;    // 0-100 score
    int    stock;         // units available now
    int    maxStock;      // warehouse capacity for this item
    string expiryDate;
    double rating;
    double turnoverRate;  // how fast this product sells (used in greedy)
    vector<int> salesHistory; // actual past daily sales for real forecast avg
};

// AVL Binary Search Tree node
struct BSTNode {
    Product* data;
    BSTNode* left;
    BSTNode* right;
    int height;
};

// Singly-linked list node — used for warehouse inventory
struct WNode {
    int   productId;
    int   quantity;
    WNode* next;
};

// Warehouse — also acts as a graph node
struct Warehouse {
    int    id;
    string name;
    string location;
    int    capacity;
    string status;
    WNode* inventory;                   // head of linked list
    vector<pair<Warehouse*, int>> conn; // graph adjacency list (neighbour, distance)
};

// One line in the shopping cart
struct CartItem {
    int    productId;
    string name;
    double price;
    int    quantity;
};

// A person who shops
struct Customer {
    int    id;
    string name;
    bool   isLoyalty; // loyalty members get higher checkout priority
    vector<string> receipts;
};

// ============================================================
//  PART 2 — GLOBALS
// ============================================================

BSTNode*           bstRoot = nullptr;
vector<Product*>   catalog;             // all products (for iteration)
vector<Product*>   priceIndex;          // same products sorted by price
vector<Warehouse*> warehouses;
vector<CartItem*>  cart;
stack<vector<CartItem*>> undoSt;        // undo stack (each entry = snapshot)
stack<vector<CartItem*>> redoSt;        // redo stack
vector<Customer*>  customers;
priority_queue<pair<int,int>> cQueue;   // (priority, customerId); max-heap


//  PART 3 — DISPLAY HELPERS


void line(char c = '-', int n = 68) { for (int i = 0; i < n; i++) cout << c; cout << "\n"; }
void header(string t) { line('='); cout << "  " << t << "\n"; line('='); }
void pause() { cout << "\nPress Enter to continue..."; cin.get(); }

//  PART 4 — AVL BST


int ht(BSTNode* n) { return n ? n->height : 0; }

void updH(BSTNode* n) {
    if (n) n->height = 1 + max(ht(n->left), ht(n->right));
}

int bal(BSTNode* n) { return n ? ht(n->left) - ht(n->right) : 0; }

BSTNode* mkNode(Product* p) {
    BSTNode* n = new BSTNode;
    n->data = p; n->left = n->right = nullptr; n->height = 1;
    return n;
}

// Right rotation — fixes Left-Left imbalance

BSTNode* rotR(BSTNode* y) {
    BSTNode* x = y->left;
    y->left    = x->right;
    x->right   = y;
    updH(y); updH(x);
    return x;
}

// Left rotation — fixes Right-Right imbalance
BSTNode* rotL(BSTNode* x) {
    BSTNode* y = x->right;
    x->right   = y->left;
    y->left    = x;
    updH(x); updH(y);
    return y;
}

// Insert a product and rebalance the AVL tree
BSTNode* bstIns(BSTNode* r, Product* p) {
    // Step 1: standard BST insert
    if (!r) return mkNode(p);
    if      (p->id < r->data->id) r->left  = bstIns(r->left,  p);
    else if (p->id > r->data->id) r->right = bstIns(r->right, p);
    else return r; // duplicate — skip

    // Step 2: update height
    updH(r);

    // Step 3: check balance and fix if broken
    int b = bal(r);

    // Left-Left: new node went to left subtree's left
    if (b > 1  && p->id < r->left->data->id)  return rotR(r);
    // Right-Right: new node went to right subtree's right
    if (b < -1 && p->id > r->right->data->id) return rotL(r);
    // Left-Right: new node went to left subtree's right
    if (b > 1  && p->id > r->left->data->id)  { r->left  = rotL(r->left);  return rotR(r); }
    // Right-Left: new node went to right subtree's left
    if (b < -1 && p->id < r->right->data->id) { r->right = rotR(r->right); return rotL(r); }

    return r; // already balanced
}

// Search by ID — O(log n) because tree is balanced
Product* bstFind(BSTNode* r, int id) {
    if (!r) return nullptr;
    if (id == r->data->id) return r->data;
    return id < r->data->id ? bstFind(r->left, id) : bstFind(r->right, id);
}

// Delete a node and rebalance
BSTNode* bstDel(BSTNode* r, int id) {
    if (!r) return nullptr;
    if      (id < r->data->id) r->left  = bstDel(r->left,  id);
    else if (id > r->data->id) r->right = bstDel(r->right, id);
    else {
        // Found — handle 0, 1, or 2 children
        if (!r->left)  { BSTNode* t = r->right; delete r; return t; }
        if (!r->right) { BSTNode* t = r->left;  delete r; return t; }
        // Two children: copy in-order successor (smallest in right subtree)
        BSTNode* s = r->right;
        while (s->left) s = s->left;
        r->data  = s->data;
        r->right = bstDel(r->right, s->data->id);
    }
    if (!r) return nullptr;
    updH(r);
    int b = bal(r);
    if (b > 1  && bal(r->left)  >= 0) return rotR(r);
    if (b > 1  && bal(r->left)  <  0) { r->left  = rotL(r->left);  return rotR(r); }
    if (b < -1 && bal(r->right) <= 0) return rotL(r);
    if (b < -1 && bal(r->right) >  0) { r->right = rotR(r->right); return rotL(r); }
    return r;
}

//  PART 5 — SORT HELPERS


// For building the price-sorted secondary index
bool byPrice(Product* a, Product* b) { return a->price < b->price; }

// Multi-level sort: category (A-Z) -> popularity (high first) -> price (low first)
bool multiSort(Product* a, Product* b) {
    if (a->category   != b->category)   return a->category   < b->category;
    if (a->popularity != b->popularity) return a->popularity > b->popularity;
    return a->price < b->price;
}

void rebuildPriceIndex() {
    priceIndex = catalog;
    sort(priceIndex.begin(), priceIndex.end(), byPrice);
}


//  PART 6 — DYNAMIC PRICING


void applyPricing() {
    time_t now = time(0);
    tm* t = localtime(&now);
    int hour = t->tm_hour;
    for (int i = 0; i < (int)catalog.size(); i++) {
        Product* p = catalog[i];
        double np = p->basePrice;
        if      (p->popularity > 80) np *= 1.10; // popular items cost more
        else if (p->popularity < 60) np *= 0.85; // slow movers discounted
        if (hour >= 18 && hour <= 22) np *= 1.05; // peak hour surge
        p->price = np;
    }
}

//  PART 7 — DEMAND FORECASTING


double avgSales(Product* p) {
    if (p->salesHistory.empty())
        return 5.0 + p->popularity / 10.0; // fallback for new products
    double sum = 0;
    for (int i = 0; i < (int)p->salesHistory.size(); i++) sum += p->salesHistory[i];
    return sum / p->salesHistory.size(); // arithmetic mean of real history
}

double seasonFactor() {
    time_t now = time(0);
    tm* t = localtime(&now);
    int m = t->tm_mon + 1;
    if (m >= 10 && m <= 12) return 1.25;
    if (m >= 1  && m <= 3)  return 0.85;
    return 1.00;
}

//  PART 8 — GRAPH (BFS, DFS, Dijkstra)


Warehouse* findW(int id) {
    for (int i = 0; i < (int)warehouses.size(); i++)
        if (warehouses[i]->id == id) return warehouses[i];
    return nullptr;
}

string wName(int id) {
    Warehouse* w = findW(id);
    return w ? w->name : "?";
}

// Reconstruct path from startId to targetId using the parent map
vector<int> makePath(map<int,int>& parent, int startId, int targetId) {
    vector<int> path;
    int cur = targetId;
    while (cur != startId) { path.push_back(cur); cur = parent[cur]; }
    path.push_back(startId);
    reverse(path.begin(), path.end());
    return path;
}

// Sum the edge weights along a path
int pathDist(vector<int>& path) {
    int d = 0;
    for (int i = 0; i < (int)path.size() - 1; i++) {
        Warehouse* w = findW(path[i]);
        if (!w) continue;
        for (int j = 0; j < (int)w->conn.size(); j++)
            if (w->conn[j].first->id == path[i+1]) { d += w->conn[j].second; break; }
    }
    return d;
}

// BFS: level-by-level, uses a FIFO queue, finds fewest hops
vector<int> bfsRoute(int s, int t) {
    map<int,bool> vis; map<int,int> par;
    queue<Warehouse*> q;
    Warehouse* start = findW(s);
    if (!start) return {};
    q.push(start); vis[s] = true;
    while (!q.empty()) {
        Warehouse* cur = q.front(); q.pop();
        if (cur->id == t) return makePath(par, s, t);
        for (int i = 0; i < (int)cur->conn.size(); i++) {
            Warehouse* nb = cur->conn[i].first;
            if (!vis[nb->id]) { vis[nb->id] = true; par[nb->id] = cur->id; q.push(nb); }
        }
    }
    return {};
}

// DFS: dives deep first, uses recursion
bool dfsH(Warehouse* cur, int t, map<int,bool>& vis, map<int,int>& par) {
    if (cur->id == t) return true;
    for (int i = 0; i < (int)cur->conn.size(); i++) {
        Warehouse* nb = cur->conn[i].first;
        if (!vis[nb->id]) {
            vis[nb->id] = true; par[nb->id] = cur->id;
            if (dfsH(nb, t, vis, par)) return true;
        }
    }
    return false;
}

vector<int> dfsRoute(int s, int t) {
    map<int,bool> vis; map<int,int> par;
    Warehouse* start = findW(s);
    if (!start) return {};
    vis[s] = true;
    if (dfsH(start, t, vis, par)) return makePath(par, s, t);
    return {};
}

// Dijkstra: shortest total distance, uses a min-heap priority queue
vector<int> dijkRoute(int s, int t) {
    map<int,int>  dist; map<int,int> par; map<int,bool> vis;
    for (int i = 0; i < (int)warehouses.size(); i++) dist[warehouses[i]->id] = INT_MAX;
    dist[s] = 0;
    // Min-heap: (distance, id)  — greater<> flips to min-heap
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
    pq.push({0, s});
    while (!pq.empty()) {
        int d = pq.top().first, id = pq.top().second; pq.pop();
        if (vis[id]) continue;
        vis[id] = true;
        if (id == t) break;
        Warehouse* cur = findW(id);
        if (!cur) continue;
        for (int i = 0; i < (int)cur->conn.size(); i++) {
            int nb  = cur->conn[i].first->id;
            int nd  = d + cur->conn[i].second;
            if (nd < dist[nb]) { dist[nb] = nd; par[nb] = id; pq.push({nd, nb}); }
        }
    }
    if (dist[t] == INT_MAX) return {};
    return makePath(par, s, t);
}


//  PART 9 — LINKED LIST HELPER

void addInv(Warehouse* w, int pid, int qty) {
    WNode* cur = w->inventory;
    while (cur) {
        if (cur->productId == pid) { cur->quantity += qty; return; }
        cur = cur->next;
    }
    WNode* nn = new WNode{pid, qty, nullptr};
    if (!w->inventory) { w->inventory = nn; return; }
    WNode* tail = w->inventory;
    while (tail->next) tail = tail->next;
    tail->next = nn;
}


//  PART 10 — INITIALISE SAMPLE DATA


void initData() {
    
    auto mk = [](int id, string nm, string cat, double pr, int pop,
                 int st, int mx, string exp, double rat, double tr,
                 vector<int> hist) -> Product* {
        return new Product{id, nm, cat, pr, pr, pop, st, mx, exp, rat, tr, hist};
    };

    auto add = [&](Product* p) {
        catalog.push_back(p);
        bstRoot = bstIns(bstRoot, p); // insert into AVL BST
    };

    add(mk(1,  "Laptop",     "Electronics", 999.99, 85, 50,  150, "2028-12-31", 4.8, 0.65, {12,14,11,15,13,10,16,14,12,15}));
    add(mk(2,  "Mouse",      "Electronics",  29.99, 90, 200, 300, "2027-06-30", 4.3, 0.85, {28,30,25,32,27,29,31,26,30,28}));
    add(mk(3,  "Keyboard",   "Electronics",  79.99, 88, 150, 250, "2027-08-15", 4.5, 0.72, {20,22,19,24,21,23,20,22,19,21}));
    add(mk(4,  "Monitor",    "Electronics", 349.99, 75,  80, 200, "2028-02-28", 4.6, 0.55, {8,7,9,10,8,7,9,8,10,9}));
    add(mk(5,  "Headphones", "Electronics", 149.99, 82, 120, 200, "2027-11-20", 4.2, 0.60, {15,14,16,13,15,17,14,16,15,13}));
    add(mk(6,  "T-Shirt",    "Clothing",     19.99, 95, 300, 500, "2026-08-01", 4.7, 0.95, {45,50,48,52,47,53,49,51,46,50}));
    add(mk(7,  "Jeans",      "Clothing",     59.99, 80, 180, 250, "2029-01-01", 4.1, 0.70, {22,20,24,21,23,19,22,21,20,23}));
    add(mk(8,  "Jacket",     "Clothing",     89.99, 70, 100, 150, "2029-01-01", 4.0, 0.45, {10,9,11,10,12,9,10,11,9,10}));
    add(mk(9,  "Sneakers",   "Footwear",    129.99, 88, 150, 200, "2028-10-10", 4.9, 0.80, {18,20,17,19,21,18,20,19,17,20}));
    add(mk(10, "Boots",      "Footwear",    159.99, 65,  90, 120, "2028-10-10", 4.4, 0.40, {7,8,6,9,7,8,7,6,8,7}));

    rebuildPriceIndex(); // build secondary sorted index

    // Create 3 warehouses (graph nodes)
    Warehouse* w1 = new Warehouse{1, "Main Warehouse", "Central Hub", 10000, "Active", nullptr, {}};
    Warehouse* w2 = new Warehouse{2, "East Coast Hub", "New York",     8000, "Active", nullptr, {}};
    Warehouse* w3 = new Warehouse{3, "West Coast Hub", "California",   7500, "Active", nullptr, {}};

    // Connect warehouses with distances in miles (graph edges, undirected)
    w1->conn.push_back({w2,  250});  w2->conn.push_back({w1,  250});
    w1->conn.push_back({w3, 2800});  w3->conn.push_back({w1, 2800});
    w2->conn.push_back({w3, 3000});  w3->conn.push_back({w2, 3000});

    warehouses.push_back(w1); warehouses.push_back(w2); warehouses.push_back(w3);

    // Add inventory to each warehouse (builds linked lists)
    addInv(w1,1,25); addInv(w1,2,80); addInv(w1,3,60); addInv(w1,6,120); addInv(w1,9,50);
    addInv(w2,1,15); addInv(w2,2,70); addInv(w2,5,50); addInv(w2,6,80);
    addInv(w3,3,40); addInv(w3,4,30); addInv(w3,9,50); addInv(w3,10,45);

    // Sample customers
    customers.push_back(new Customer{1, "John Doe",    true,  {"Receipt #4521 - Laptop, Mouse | Rs.1059"}});
    customers.push_back(new Customer{2, "Jane Smith",  false, {"Receipt #4502 - Sneakers | Rs.129"}});
    customers.push_back(new Customer{3, "Bob Wilson",  true,  {"Receipt #4491 - T-Shirt x3 | Rs.59"}});
    customers.push_back(new Customer{4, "Alice Brown", false, {}});

    // Pre-fill checkout queue: 1 = loyalty priority, 0 = regular
    cQueue.push({1, 1}); // John  (loyalty member — served first)
    cQueue.push({0, 2}); // Jane  (regular)
    cQueue.push({1, 3}); // Bob   (loyalty member — served first)
}


//  PART 11 — DISPLAY A PRODUCT TABLE

void showProducts(vector<Product*>& list) {
    if (list.empty()) { cout << "  No products found.\n"; return; }
    cout << left << setw(4) << "ID" << setw(14) << "Name"
         << setw(13) << "Category" << setw(10) << "Price Rs"
         << setw(8) << "Stock" << setw(6) << "Pop" << "Expiry\n";
    line();
    for (int i = 0; i < (int)list.size(); i++) {
        Product* p = list[i];
        cout << left
             << setw(4)  << p->id
             << setw(14) << p->name
             << setw(13) << p->category
             << setw(10) << fixed << setprecision(2) << p->price
             << setw(8)  << p->stock
             << setw(6)  << p->popularity
             << p->expiryDate << "\n";
    }
}


//  PART 12 — MENU: PRODUCTS


void menuProducts() {
    int ch;
    while (true) {
        applyPricing();
        header("PRODUCT CATALOG");
        cout << "  1. Show all products\n"
             << "  2. Search by ID          (AVL BST — O(log n))\n"
             << "  3. Multi-level sort       (category > popularity > price)\n"
             << "  4. Filter by price range  (binary search — O(log n))\n"
             << "  5. Filter by category\n"
             << "  6. Add product\n"
             << "  7. Delete product\n"
             << "  0. Back\n";
        line();
        cout << "Choice: "; cin >> ch; cin.ignore();
        if (ch == 0) break;

        if (ch == 1) {
            header("ALL PRODUCTS");
            showProducts(catalog);
        }
        else if (ch == 2) {
            int id; cout << "Enter product ID: "; cin >> id; cin.ignore();
            Product* p = bstFind(bstRoot, id); // O(log n) BST search
            if (!p) cout << "  Not found.\n";
            else { header("FOUND (AVL BST)"); vector<Product*> tmp = {p}; showProducts(tmp); }
        }
        else if (ch == 3) {
            vector<Product*> s = catalog;
            sort(s.begin(), s.end(), multiSort); // multi-level comparator
            header("SORTED: Category > Popularity > Price");
            showProducts(s);
        }
        else if (ch == 4) {
            // Binary search — O(log n) because priceIndex is sorted
            double lo, hi;
            cout << "Min price: Rs."; cin >> lo;
            cout << "Max price: Rs."; cin >> hi; cin.ignore();
            rebuildPriceIndex();

            // lower_bound: first element with price >= lo
            auto it1 = lower_bound(priceIndex.begin(), priceIndex.end(), lo,
                [](Product* p, double v) { return p->price < v; });
            // upper_bound: first element with price > hi
            auto it2 = upper_bound(priceIndex.begin(), priceIndex.end(), hi,
                [](double v, Product* p) { return v < p->price; });

            vector<Product*> res(it1, it2); // O(log n) slice
            header("PRICE RANGE RESULTS (Binary Search)");
            showProducts(res);
        }
        else if (ch == 5) {
            string cat;
            cout << "Category (Electronics / Clothing / Footwear): "; getline(cin, cat);
            vector<Product*> res;
            for (int i = 0; i < (int)catalog.size(); i++)
                if (catalog[i]->category == cat) res.push_back(catalog[i]);
            header("CATEGORY: " + cat);
            showProducts(res);
        }
        else if (ch == 6) {
            string name, cat, exp;
            double pr; int st, mx;
            cout << "Name: "; getline(cin, name);
            cout << "Category: "; getline(cin, cat);
            cout << "Price: "; cin >> pr;
            cout << "Stock: "; cin >> st;
            cout << "Max stock: "; cin >> mx; cin.ignore();
            cout << "Expiry (YYYY-MM-DD): "; getline(cin, exp);
            int newId = catalog.empty() ? 1 : catalog.back()->id + 1;
            Product* np = new Product{newId, name, cat, pr, pr, 50, st, mx, exp, 4.0, 0.5, {}};
            catalog.push_back(np);
            bstRoot = bstIns(bstRoot, np);
            rebuildPriceIndex();
            addInv(warehouses[0], newId, st);
            cout << "  Added! ID = " << newId << "\n";
        }
        else if (ch == 7) {
            int id; cout << "Product ID to delete: "; cin >> id; cin.ignore();
            Product* p = bstFind(bstRoot, id);
            if (!p) { cout << "  Not found.\n"; }
            else {
                bstRoot = bstDel(bstRoot, id);
                for (auto it = catalog.begin(); it != catalog.end(); ++it)
                    if ((*it)->id == id) { catalog.erase(it); break; }
                // Remove from every warehouse's linked list
                for (int w = 0; w < (int)warehouses.size(); w++) {
                    WNode* cur = warehouses[w]->inventory, *prev = nullptr;
                    while (cur) {
                        if (cur->productId == id) {
                            if (prev) prev->next = cur->next;
                            else warehouses[w]->inventory = cur->next;
                            delete cur; break;
                        }
                        prev = cur; cur = cur->next;
                    }
                }
                rebuildPriceIndex();
                delete p;
                cout << "  Deleted.\n";
            }
        }
        pause();
    }
}


//  PART 13 — MENU: WAREHOUSES


void menuWarehouses() {
    int ch;
    while (true) {
        header("WAREHOUSE MANAGEMENT");
        cout << "  1. View warehouses  (linked list + graph)\n"
             << "  2. Transfer stock between warehouses\n"
             << "  3. Find route  (BFS / DFS / Dijkstra)\n"
             << "  0. Back\n";
        line();
        cout << "Choice: "; cin >> ch; cin.ignore();
        if (ch == 0) break;

        if (ch == 1) {
            header("ALL WAREHOUSES");
            for (int i = 0; i < (int)warehouses.size(); i++) {
                Warehouse* w = warehouses[i];
                cout << "\n[ID " << w->id << "] " << w->name
                     << " | " << w->location
                     << " | Capacity: " << w->capacity << "\n";

                // Walk linked list to show inventory
                cout << "  Inventory (Linked List):\n";
                int total = 0;
                WNode* node = w->inventory;
                while (node) {
                    total += node->quantity;
                    Product* p = bstFind(bstRoot, node->productId);
                    cout << "    -> [" << node->productId << "] "
                         << (p ? p->name : "?") << ": " << node->quantity << "\n";
                    node = node->next; // follow the pointer to next node
                }
                cout << "  Total: " << total << " units\n";

                // Show graph edges
                cout << "  Connected to: ";
                for (int j = 0; j < (int)w->conn.size(); j++)
                    cout << w->conn[j].first->name << " (" << w->conn[j].second << " mi)  ";
                cout << "\n";
            }
        }
        else if (ch == 2) {
            int fid, tid, pid, qty;
            cout << "From ID: "; cin >> fid;
            cout << "To ID:   "; cin >> tid;
            cout << "Product ID: "; cin >> pid;
            cout << "Qty: "; cin >> qty; cin.ignore();
            Warehouse* from = findW(fid), *to = findW(tid);
            if (!from || !to) { cout << "  Invalid ID.\n"; }
            else {
                // Deduct from source linked list
                WNode* cur = from->inventory; bool ok = false;
                while (cur) {
                    if (cur->productId == pid && cur->quantity >= qty) {
                        cur->quantity -= qty; ok = true; break;
                    }
                    cur = cur->next;
                }
                if (!ok) cout << "  Insufficient stock.\n";
                else { addInv(to, pid, qty); cout << "  Transfer done!\n"; }
            }
        }
        else if (ch == 3) {
            int fid, tid, algo;
            cout << "From ID: "; cin >> fid;
            cout << "To ID:   "; cin >> tid;
            cout << "1=BFS  2=DFS  3=Dijkstra: "; cin >> algo; cin.ignore();
            vector<int> path;
            string method;
            if      (algo == 1) { path = bfsRoute(fid, tid);  method = "BFS"; }
            else if (algo == 2) { path = dfsRoute(fid, tid);  method = "DFS"; }
            else                { path = dijkRoute(fid, tid); method = "Dijkstra"; }
            header("ROUTE (" + method + ")");
            if (path.empty()) cout << "  No route found.\n";
            else {
                cout << "  Path: ";
                for (int i = 0; i < (int)path.size(); i++) {
                    cout << wName(path[i]);
                    if (i < (int)path.size()-1) cout << " -> ";
                }
                int d = pathDist(path);
                cout << "\n  Distance: " << d << " miles"
                     << "  |  Truck: Rs." << fixed << setprecision(0) << d*0.15
                     << "  |  Air: Rs."   << d*1.20 << "\n";
            }
        }
        pause();
    }
}

//  PART 14 — MENU: CART (Stack-based Undo/Redo)


void menuCart() {
    int ch;
    while (true) {
        applyPricing();
        header("SHOPPING CART  (Stack — Undo/Redo)");
        cout << "  1. View cart\n"
             << "  2. Add item\n"
             << "  3. Undo last add  (pop undo stack)\n"
             << "  4. Redo           (pop redo stack)\n"
             << "  0. Back\n";
        line();
        cout << "Choice: "; cin >> ch; cin.ignore();
        if (ch == 0) break;

        if (ch == 1) {
            header("CART");
            if (cart.empty()) { cout << "  Cart is empty.\n"; }
            else {
                double total = 0;
                cout << left << setw(4) << "ID" << setw(14) << "Name"
                     << setw(10) << "Price" << setw(6) << "Qty" << "Subtotal\n";
                line();
                for (int i = 0; i < (int)cart.size(); i++) {
                    double sub = cart[i]->price * cart[i]->quantity;
                    total += sub;
                    cout << left << setw(4) << cart[i]->productId
                         << setw(14) << cart[i]->name
                         << setw(10) << fixed << setprecision(2) << cart[i]->price
                         << setw(6)  << cart[i]->quantity << sub << "\n";
                }
                line(); cout << "  TOTAL: Rs." << fixed << setprecision(2) << total << "\n";
            }
        }
        else if (ch == 2) {
            int pid, qty;
            cout << "Product ID: "; cin >> pid;
            cout << "Quantity:   "; cin >> qty; cin.ignore();
            if (qty <= 0) qty = 1;
            Product* p = bstFind(bstRoot, pid);
            if (!p) { cout << "  Product not found.\n"; }
            else {
                // Check how many are already in cart
                int inCart = 0;
                for (int i = 0; i < (int)cart.size(); i++)
                    if (cart[i]->productId == pid) inCart += cart[i]->quantity;

                if (inCart + qty > p->stock) {
                    // Stock validation — Feature 5 requirement
                    cout << "  Only " << (p->stock - inCart) << " units available!\n";
                } else {
                    // Save CURRENT cart state on undo stack BEFORE modifying
                    undoSt.push(cart);
                    while (!redoSt.empty()) redoSt.pop(); // new action clears redo

                    bool found = false;
                    for (int i = 0; i < (int)cart.size(); i++) {
                        if (cart[i]->productId == pid) {
                            cart[i]->quantity += qty; found = true; break;
                        }
                    }
                    if (!found) cart.push_back(new CartItem{p->id, p->name, p->price, qty});
                    cout << "  Added " << qty << "x " << p->name << "\n";
                }
            }
        }
        else if (ch == 3) {
            // UNDO: restore the cart to its state before the last add
            if (undoSt.empty()) cout << "  Nothing to undo.\n";
            else {
                redoSt.push(cart);       // save current state for potential redo
                cart = undoSt.top();     // restore previous snapshot
                undoSt.pop();
                cout << "  Undone.\n";
            }
        }
        else if (ch == 4) {
            // REDO: re-apply an action that was undone
            if (redoSt.empty()) cout << "  Nothing to redo.\n";
            else {
                undoSt.push(cart);
                cart = redoSt.top();
                redoSt.pop();
                cout << "  Redone.\n";
            }
        }
        pause();
    }
}


//  PART 15 — MENU: CHECKOUT (Priority Queue)


void menuCheckout() {
    int ch;
    while (true) {
        header("CHECKOUT  (Priority Queue — Loyalty First)");
        cout << "  1. View queue\n"
             << "  2. Add customer to queue\n"
             << "  3. Serve next customer\n"
             << "  0. Back\n";
        line();
        cout << "Choice: "; cin >> ch; cin.ignore();
        if (ch == 0) break;

        if (ch == 1) {
            header("QUEUE");
            if (cQueue.empty()) { cout << "  Queue is empty.\n"; }
            else {
                priority_queue<pair<int,int>> copy = cQueue;
                int pos = 1;
                while (!copy.empty()) {
                    int pri = copy.top().first, cid = copy.top().second;
                    copy.pop();
                    string nm = "Unknown";
                    for (int i = 0; i < (int)customers.size(); i++)
                        if (customers[i]->id == cid) nm = customers[i]->name;
                    cout << "  " << pos++ << ". " << nm
                         << (pri ? " [LOYALTY]" : " [Regular]") << "\n";
                }
            }
        }
        else if (ch == 2) {
            string nm; int loy;
            cout << "Name: "; getline(cin, nm);
            cout << "Loyalty? (1=Yes 0=No): "; cin >> loy; cin.ignore();
            int nid = customers.empty() ? 1 : customers.back()->id + 1;
            customers.push_back(new Customer{nid, nm, (bool)loy, {}});
            cQueue.push({loy, nid}); // higher value = served sooner
            cout << "  Queued!\n";
        }
        else if (ch == 3) {
            if (cQueue.empty()) { cout << "  Queue is empty.\n"; }
            else {
                int cid = cQueue.top().second; cQueue.pop(); // dequeue
                Customer* c = nullptr;
                for (int i = 0; i < (int)customers.size(); i++)
                    if (customers[i]->id == cid) c = customers[i];
                if (c) {
                    double sub = 0; string items = "";
                    for (int i = 0; i < (int)cart.size(); i++) {
                        sub += cart[i]->price * cart[i]->quantity;
                        items += to_string(cart[i]->quantity) + "x " + cart[i]->name + "  ";
                        Product* p = bstFind(bstRoot, cart[i]->productId);
                        if (p) {
                            p->stock = max(0, p->stock - cart[i]->quantity);
                            p->salesHistory.push_back(cart[i]->quantity); // record sale
                        }
                    }
                    if (sub == 0) { sub = 249.99; items = "Sample order"; }
                    cart.clear();
                    double disc  = c->isLoyalty ? sub * 0.10 : 0.0;
                    double tax   = (sub - disc) * 0.08;
                    double total = sub - disc + tax;
                    c->receipts.push_back("Receipt - " + items + "Rs." + to_string((int)total));
                    header("RECEIPT");
                    cout << "  Customer: " << c->name
                         << (c->isLoyalty ? " [LOYALTY — 10% discount]" : "") << "\n"
                         << "  Items:    " << items << "\n"
                         << "  Subtotal: Rs." << fixed << setprecision(2) << sub << "\n";
                    if (disc > 0) cout << "  Discount: Rs." << disc << "\n";
                    cout << "  Tax (8%): Rs." << tax << "\n";
                    line();
                    cout << "  TOTAL:    Rs." << total << "\n";
                }
            }
        }
        pause();
    }
}


//  PART 16 — MENU: ALERTS


void menuAlerts() {
    header("SMART ALERTS");
    applyPricing();
    double sf = seasonFactor();
    bool any = false;

    for (int i = 0; i < (int)catalog.size(); i++) {
        Product* p = catalog[i];

        // Expiry alert
        if (p->expiryDate.substr(0,4) == "2026") {
            cout << "  [EXPIRY]     " << p->name << " — expires " << p->expiryDate << "\n";
            any = true;
        }
        // Overstock alert
        if (p->stock >= p->maxStock * 0.8) {
            cout << "  [OVERSTOCK]  " << p->name << ": " << p->stock << "/" << p->maxStock << "\n";
            any = true;
        }
        // Demand spike
        if (p->popularity >= 92) {
            cout << "  [HOT ITEM]   " << p->name << " — popularity " << p->popularity << "%\n";
            any = true;
        }
        // Low stock: threshold = 7-day forecast (NOT a hardcoded number)
        int threshold = max(5, (int)ceil(avgSales(p) * 7 * sf));
        if (p->stock <= threshold) {
            cout << "  [LOW STOCK]  " << p->name
                 << ": " << p->stock << " units left (7-day need: " << threshold << ")\n";
            any = true;
        }
    }
    if (!any) cout << "  No alerts right now.\n";
    pause();
}


//  PART 17 — MENU: RESTOCK (Greedy Algorithm)


void menuRestock() {
    header("RESTOCK PLANNER  (Greedy: highest turnover/cost first)");
    cout << "Enter budget (Rs.): ";
    double budget; cin >> budget; cin.ignore();
    if (budget <= 0) budget = 8000;

    struct Cand { Product* p; double costPerUnit; string supplier; double score; };
    vector<Cand> list;

    for (int i = 0; i < (int)catalog.size(); i++) {
        Product* p = catalog[i];
        if (p->stock >= p->maxStock * 0.6) continue; // already well-stocked

        // Pick cheapest supplier per category
        double cost; string sup;
        if      (p->category == "Electronics") { cost = 420.0; sup = "AsiaTech"; }
        else if (p->category == "Clothing")    { cost =   7.5; sup = "Niche Styles"; }
        else                                   { cost =  55.0; sup = "ActiveWare"; }

        // Greedy score = how much turnover per rupee spent restocking
        list.push_back({p, cost, sup, p->turnoverRate / cost});
    }

    if (list.empty()) { cout << "  Nothing needs restocking.\n"; pause(); return; }

    // Sort descending by score — best value-for-money gets budget first
    sort(list.begin(), list.end(), [](Cand& a, Cand& b) { return a.score > b.score; });

    cout << "\n" << left << setw(14) << "Product" << setw(13) << "Category"
         << setw(8) << "Units" << setw(20) << "Supplier" << setw(10) << "Unit Rs" << "Total Rs\n";
    line();

    double rem = budget;
    for (int i = 0; i < (int)list.size(); i++) {
        Product* p = list[i].p;
        int qty    = p->maxStock - p->stock;
        double cost = qty * list[i].costPerUnit;
        if (cost > rem) { qty = (int)(rem / list[i].costPerUnit); cost = qty * list[i].costPerUnit; }
        if (qty <= 0) continue;
        rem -= cost;
        cout << left << setw(14) << p->name << setw(13) << p->category
             << setw(8) << qty << setw(20) << list[i].supplier
             << setw(10) << fixed << setprecision(2) << list[i].costPerUnit << cost << "\n";
    }
    line();
    cout << "  Budget remaining: Rs." << fixed << setprecision(2) << rem << "\n";
    pause();
}

//  PART 18 — MENU: DEMAND FORECAST


void menuForecast() {
    header("DEMAND FORECAST");
    double sf = seasonFactor();
    cout << "  Season factor: " << sf << "x";
    if      (sf == 1.25) cout << "  (Festive Oct-Dec — demand up 25%)";
    else if (sf == 0.85) cout << "  (Slow Jan-Mar — demand down 15%)";
    else                  cout << "  (Normal)";
    cout << "\n\n";

    cout << left << setw(14) << "Product" << setw(10) << "Avg/Day"
         << setw(10) << "Daily" << setw(10) << "Weekly" << setw(12) << "Monthly"
         << "Alert Threshold\n";
    line();

    for (int i = 0; i < (int)catalog.size(); i++) {
        Product* p = catalog[i];
        double av  = avgSales(p);          // real arithmetic mean of salesHistory
        int daily  = max(1,  (int)ceil(av * sf));
        int weekly = max(5,  (int)ceil(av * 7  * sf));
        int monthly= max(20, (int)ceil(av * 30 * sf));
        cout << left << setw(14) << p->name
             << setw(10) << fixed << setprecision(1) << av
             << setw(10) << daily << setw(10) << weekly << setw(12) << monthly
             << weekly << "\n";
    }
    cout << "\n  Note: alert fires when stock <= weekly forecast\n";
    pause();
}


//  PART 19 — MENU: CUSTOMERS

void menuCustomers() {
    int ch;
    while (true) {
        header("CUSTOMERS");
        cout << "  1. View all\n  2. Add customer\n  0. Back\n";
        line();
        cout << "Choice: "; cin >> ch; cin.ignore();
        if (ch == 0) break;

        if (ch == 1) {
            header("ALL CUSTOMERS");
            for (int i = 0; i < (int)customers.size(); i++) {
                Customer* c = customers[i];
                cout << "  [" << c->id << "] " << c->name
                     << (c->isLoyalty ? " [LOYALTY]" : " [Regular]") << "\n";
                for (int j = 0; j < (int)c->receipts.size(); j++)
                    cout << "    " << c->receipts[j] << "\n";
            }
        }
        else if (ch == 2) {
            string nm; int loy;
            cout << "Name: "; getline(cin, nm);
            cout << "Loyalty? (1=Yes 0=No): "; cin >> loy; cin.ignore();
            int nid = customers.empty() ? 1 : customers.back()->id + 1;
            customers.push_back(new Customer{nid, nm, (bool)loy, {}});
            cout << "  Added! ID = " << nid << "\n";
        }
        pause();
    }
}


//  PART 20 — MAIN


int main() {
    initData();
    applyPricing();

    cout << "\n";
    line('*');
    cout << "   E-COMMERCE INVENTORY MANAGEMENT SYSTEM \n";
    line('*');

    int ch;
    while (true) {
        header("MAIN MENU");
        cout << "  1. Product Catalog       (BST, binary search, multi-sort)\n"
             << "  2. Warehouse Management  (linked list, graph, BFS/DFS/Dijkstra)\n"
             << "  3. Shopping Cart         (stack, undo/redo)\n"
             << "  4. Checkout Queue        (priority queue, loyalty first)\n"
             << "  5. Smart Alerts          (forecast-based thresholds)\n"
             << "  6. Restock Planner       (greedy algorithm)\n"
             << "  7. Demand Forecast       (avg history x seasonality)\n"
             << "  8. Customers\n"
             << "  0. Exit\n";
        line();
        cout << "Choice: "; cin >> ch; cin.ignore();
        switch (ch) {
            case 1: menuProducts();   break;
            case 2: menuWarehouses(); break;
            case 3: menuCart();       break;
            case 4: menuCheckout();   break;
            case 5: menuAlerts();     break;
            case 6: menuRestock();    break;
            case 7: menuForecast();   break;
            case 8: menuCustomers();  break;
            case 0: cout << "\n  Goodbye!\n\n"; return 0;
            default: cout << "  Invalid choice.\n"; pause();
        }
    }
}

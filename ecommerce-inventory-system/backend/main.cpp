#include <iostream>
#include <vector>
#include <string>
#include <stack>
#include <queue>
#include <algorithm>
#include <map>
#include <ctime>
#include <cmath>
#include <sstream>
#include <thread>
#include <mutex>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>

using namespace std;

// Mutex for thread-safety in backend state
mutex dbMutex;

// ==================== STRUCTURES AND SYSTEM MODELS ====================

// Product Structure
struct Product {
    int id;
    string name;
    string category;
    double basePrice;
    double price;            // Dynamic price
    int popularity;          // Rating or demand factor (0-100)
    int stock;
    int maxStock;
    string expiryDate;       // Expiration Alert trigger
    double rating;           // Product rating (1.0 to 5.0)
    double turnoverRate;     // Sales velocity tracking

    Product(int i, string n, string c, double p, int pop, int s, int maxS, string exp, double rat, double turn) 
        : id(i), name(n), category(c), basePrice(p), price(p), popularity(pop), stock(s), maxStock(maxS), expiryDate(exp), rating(rat), turnoverRate(turn) {}
};

// BST node keyed on product->id for O(log n) catalog lookups
struct BSTNode {
    Product* data;
    BSTNode* left;
    BSTNode* right;

    BSTNode(Product* p) : data(p), left(nullptr), right(nullptr) {}
};

// Linked List Node for Warehouse Inventory
struct WarehouseNode {
    int productId;
    int quantity;
    WarehouseNode* next;
    
    WarehouseNode(int pid, int qty) : productId(pid), quantity(qty), next(nullptr) {}
};

// Graph Node for Warehouse Connections
struct Warehouse {
    int id;
    string name;
    string location;
    int capacity;
    string status;
    WarehouseNode* inventory;
    
    // Graph edges: pair of (connected warehouse, distance in miles)
    vector<pair<Warehouse*, int>> connections;
    
    Warehouse(int i, string n, string loc, int cap, string stat) 
        : id(i), name(n), location(loc), capacity(cap), status(stat), inventory(nullptr) {}
};

// Cart Item for Stack-based Shopping Carts
struct CartItem {
    int productId;
    string name;
    string category;
    double price;
    int quantity;
    int stock;
    string image;
    
    CartItem(int pid, string n, string cat, double pr, int qty, int st, string img)
        : productId(pid), name(n), category(cat), price(pr), quantity(qty), stock(st), image(img) {}
};

// Customer Structure
struct Customer {
    int id;
    string name;
    bool isLoyaltyMember;
    string registrationDate;
    vector<string> purchaseHistory; // List of past purchase receipts
    
    Customer(int i, string n, bool loyalty, string regDate = "2026-01-01") 
        : id(i), name(n), isLoyaltyMember(loyalty), registrationDate(regDate) {}
};

// Supplier Structure for Recommendations
struct Supplier {
    string name;
    double costPerUnit;
    int deliveryDays;
    double reliabilityScore; // (0.0 to 1.0)
};

// ==================== FLAT JSON PARSER HELPERS ====================
// These are simple string search helpers that make C++ JSON parsing extremely easy,
// robust, and fast without requiring external JSON libraries.

string getJsonStringValue(const string& json, const string& key) {
    size_t pos = json.find("\"" + key + "\"");
    if (pos == string::npos) return "";
    pos = json.find(":", pos);
    if (pos == string::npos) return "";
    size_t start = json.find("\"", pos);
    if (start == string::npos) return "";
    size_t end = json.find("\"", start + 1);
    if (end == string::npos) return "";
    return json.substr(start + 1, end - start - 1);
}

double getJsonDoubleValue(const string& json, const string& key) {
    size_t pos = json.find("\"" + key + "\"");
    if (pos == string::npos) return 0.0;
    pos = json.find(":", pos);
    if (pos == string::npos) return 0.0;
    size_t start = json.find_first_of("-0123456789.", pos);
    if (start == string::npos) return 0.0;
    size_t end = json.find_first_not_of("-0123456789.eE", start);
    string valStr = json.substr(start, end - start);
    try { return stod(valStr); } catch (...) { return 0.0; }
}

int getJsonIntValue(const string& json, const string& key) {
    return (int)getJsonDoubleValue(json, key);
}

bool getJsonBoolValue(const string& json, const string& key) {
    size_t pos = json.find("\"" + key + "\"");
    if (pos == string::npos) return false;
    pos = json.find(":", pos);
    if (pos == string::npos) return false;
    size_t truePos = json.find("true", pos);
    size_t falsePos = json.find("false", pos);
    if (truePos != string::npos && (falsePos == string::npos || truePos < falsePos)) {
        return true;
    }
    return false;
}

// ==================== PRODUCT CATALOG BST (keyed by product ID) ====================

BSTNode* productCatalogBST = nullptr;

void insert(BSTNode*& root, Product* p) {
    if (!p) return;
    if (!root) {
        root = new BSTNode(p);
        return;
    }
    if (p->id < root->data->id) {
        insert(root->left, p);
    } else if (p->id > root->data->id) {
        insert(root->right, p);
    }
    // duplicate id: keep existing node
}

Product* searchById(BSTNode* root, int id) {
    if (!root) return nullptr;
    if (id < root->data->id) return searchById(root->left, id);
    if (id > root->data->id) return searchById(root->right, id);
    return root->data;
}

void inorderList(BSTNode* root, vector<Product*>& out) {
    if (!root) return;
    inorderList(root->left, out);
    out.push_back(root->data);
    inorderList(root->right, out);
}

void deleteNode(BSTNode*& root, int id) {
    if (!root) return;
    if (id < root->data->id) {
        deleteNode(root->left, id);
    } else if (id > root->data->id) {
        deleteNode(root->right, id);
    } else {
        if (!root->left) {
            BSTNode* temp = root->right;
            delete root;
            root = temp;
        } else if (!root->right) {
            BSTNode* temp = root->left;
            delete root;
            root = temp;
        } else {
            BSTNode* succ = root->right;
            while (succ->left) succ = succ->left;
            root->data = succ->data;
            deleteNode(root->right, succ->data->id);
        }
    }
}

// ==================== IN-MEMORY DATABASE ====================

vector<Product*> catalog;  // secondary store for iteration (GET /api/products, forecasts, etc.)
vector<Product*> priceSortedCatalog;  // auxiliary price-sorted index for O(log n) range queries
vector<Warehouse*> warehouses;
vector<CartItem*> activeCart;
stack<vector<CartItem*>> cartUndoStack;
stack<vector<CartItem*>> cartRedoStack;
vector<Customer*> customers;

// Priority checkout queue: pair(priority, customerId) — loyalty=1, regular=0 (higher served first)
priority_queue<pair<int, int>, vector<pair<int, int>>, less<pair<int, int>>> checkoutQueue;

bool sortByPriceOnly(const Product* a, const Product* b);

// Initializers
void initializeDB() {
    // 1. Initial Products
    catalog.push_back(new Product(1, "Laptop", "Electronics", 999.99, 85, 50, 150, "2028-12-31", 4.8, 0.65));
    catalog.push_back(new Product(2, "Mouse", "Electronics", 29.99, 90, 200, 300, "2027-06-30", 4.3, 0.85));
    catalog.push_back(new Product(3, "Keyboard", "Electronics", 79.99, 88, 150, 250, "2027-08-15", 4.5, 0.72));
    catalog.push_back(new Product(4, "Monitor", "Electronics", 349.99, 75, 80, 200, "2028-02-28", 4.6, 0.55));
    catalog.push_back(new Product(5, "Headphones", "Electronics", 149.99, 82, 120, 200, "2027-11-20", 4.2, 0.60));
    catalog.push_back(new Product(6, "T-Shirt", "Clothing", 19.99, 95, 300, 500, "2026-08-01", 4.7, 0.95)); // Perishable warning!
    catalog.push_back(new Product(7, "Jeans", "Clothing", 59.99, 80, 180, 250, "2029-01-01", 4.1, 0.70));
    catalog.push_back(new Product(8, "Jacket", "Clothing", 89.99, 70, 100, 150, "2029-01-01", 4.0, 0.45));
    catalog.push_back(new Product(9, "Sneakers", "Footwear", 129.99, 88, 150, 200, "2028-10-10", 4.9, 0.80));
    catalog.push_back(new Product(10, "Boots", "Footwear", 159.99, 65, 90, 120, "2028-10-10", 4.4, 0.40));

    for (auto p : catalog) {
        insert(productCatalogBST, p);
    }

    // Build price-sorted auxiliary index (PS_05 Feature 8)
    priceSortedCatalog = catalog;
    sort(priceSortedCatalog.begin(), priceSortedCatalog.end(), sortByPriceOnly);

    // 2. Initial Warehouses
    warehouses.push_back(new Warehouse(1, "Main Warehouse", "Central Hub", 10000, "Active"));
    warehouses.push_back(new Warehouse(2, "East Coast Hub", "New York", 8000, "Active"));
    warehouses.push_back(new Warehouse(3, "West Coast Hub", "California", 7500, "Active"));

    // Set connections (Graph structure with distance in miles)
    warehouses[0]->connections.push_back({warehouses[1], 250});
    warehouses[1]->connections.push_back({warehouses[0], 250});

    warehouses[0]->connections.push_back({warehouses[2], 2800});
    warehouses[2]->connections.push_back({warehouses[0], 2800});

    warehouses[1]->connections.push_back({warehouses[2], 3000});
    warehouses[2]->connections.push_back({warehouses[1], 3000});

    // Populate Linked List inventories
    // Warehouse 1 inventory
    WarehouseNode* w1 = new WarehouseNode(1, 25);
    w1->next = new WarehouseNode(2, 80);
    w1->next->next = new WarehouseNode(3, 60);
    w1->next->next->next = new WarehouseNode(6, 120);
    w1->next->next->next->next = new WarehouseNode(9, 50);
    warehouses[0]->inventory = w1;

    // Warehouse 2 inventory
    WarehouseNode* w2 = new WarehouseNode(1, 15);
    w2->next = new WarehouseNode(2, 70);
    w2->next->next = new WarehouseNode(5, 50);
    w2->next->next->next = new WarehouseNode(6, 80);
    warehouses[1]->inventory = w2;

    // Warehouse 3 inventory
    WarehouseNode* w3 = new WarehouseNode(3, 40);
    w3->next = new WarehouseNode(4, 30);
    w3->next->next = new WarehouseNode(9, 50);
    w3->next->next->next = new WarehouseNode(10, 45);
    warehouses[2]->inventory = w3;

    // 3. Initial Customers
    customers.push_back(new Customer(1, "John Doe", true, "2026-02-14"));
    customers.push_back(new Customer(2, "Jane Smith", false, "2026-04-01"));
    customers.push_back(new Customer(3, "Bob Wilson", true, "2026-05-10"));
    customers.push_back(new Customer(4, "Alice Brown", false, "2026-05-20"));

    // Add some initial mock purchases
    customers[0]->purchaseHistory.push_back("Receipt #4521 - 1x Laptop, 2x Mouse | Total: ₹1059.97");
    customers[1]->purchaseHistory.push_back("Receipt #4502 - 1x Sneakers | Total: ₹129.99");
    customers[2]->purchaseHistory.push_back("Receipt #4491 - 3x T-Shirt | Total: ₹59.97");

    // Priority queue waitlist: loyalty members (priority 1) ahead of regular (priority 0)
    checkoutQueue.push({1, 1}); // John Doe — loyalty
    checkoutQueue.push({0, 2}); // Jane Smith — regular
    checkoutQueue.push({1, 3}); // Bob Wilson — loyalty
}

// ==================== ALGORITHMS IMPLEMENTATION ====================

// Graph Routing Algorithms: BFS, DFS, and Dijkstra
struct SearchResult {
    vector<int> path;
    int distance;
    string method;
    vector<string> visitedNodes;
};

// BFS Path Search
SearchResult searchBFS(int startId, int targetId) {
    SearchResult result;
    result.method = "BFS (Shortest Hops)";
    result.distance = 0;

    map<int, int> parent;
    queue<Warehouse*> q;
    map<int, bool> visited;

    Warehouse* start = nullptr;
    for (auto w : warehouses) {
        if (w->id == startId) start = w;
    }
    if (!start) return result;

    q.push(start);
    visited[startId] = true;

    bool found = false;
    while (!q.empty()) {
        Warehouse* curr = q.front();
        q.pop();
        result.visitedNodes.push_back(curr->name);

        if (curr->id == targetId) {
            found = true;
            break;
        }

        for (auto edge : curr->connections) {
            Warehouse* neighbor = edge.first;
            if (!visited[neighbor->id]) {
                visited[neighbor->id] = true;
                parent[neighbor->id] = curr->id;
                q.push(neighbor);
            }
        }
    }

    if (found) {
        int curr = targetId;
        vector<int> revPath;
        while (curr != startId) {
            revPath.push_back(curr);
            curr = parent[curr];
        }
        revPath.push_back(startId);
        reverse(revPath.begin(), revPath.end());
        result.path = revPath;

        // Calculate actual mileage along the path
        for (size_t i = 0; i < result.path.size() - 1; i++) {
            int u = result.path[i];
            int v = result.path[i+1];
            Warehouse* wu = nullptr;
            for (auto w : warehouses) { if (w->id == u) wu = w; }
            for (auto edge : wu->connections) {
                if (edge.first->id == v) {
                    result.distance += edge.second;
                    break;
                }
            }
        }
    }
    return result;
}

// DFS Path Search (Recursive helper)
bool dfsHelper(Warehouse* curr, int targetId, map<int, bool>& visited, map<int, int>& parent, vector<string>& visitedNames) {
    visitedNames.push_back(curr->name);
    if (curr->id == targetId) return true;

    for (auto edge : curr->connections) {
        Warehouse* neighbor = edge.first;
        if (!visited[neighbor->id]) {
            visited[neighbor->id] = true;
            parent[neighbor->id] = curr->id;
            if (dfsHelper(neighbor, targetId, visited, parent, visitedNames)) {
                return true;
            }
        }
    }
    return false;
}

SearchResult searchDFS(int startId, int targetId) {
    SearchResult result;
    result.method = "DFS (Depth Traversal)";
    result.distance = 0;

    map<int, bool> visited;
    map<int, int> parent;
    Warehouse* start = nullptr;
    for (auto w : warehouses) {
        if (w->id == startId) start = w;
    }
    if (!start) return result;

    visited[startId] = true;
    bool found = dfsHelper(start, targetId, visited, parent, result.visitedNodes);

    if (found) {
        int curr = targetId;
        vector<int> revPath;
        while (curr != startId) {
            revPath.push_back(curr);
            curr = parent[curr];
        }
        revPath.push_back(startId);
        reverse(revPath.begin(), revPath.end());
        result.path = revPath;

        for (size_t i = 0; i < result.path.size() - 1; i++) {
            int u = result.path[i];
            int v = result.path[i+1];
            Warehouse* wu = nullptr;
            for (auto w : warehouses) { if (w->id == u) wu = w; }
            for (auto edge : wu->connections) {
                if (edge.first->id == v) {
                    result.distance += edge.second;
                    break;
                }
            }
        }
    }
    return result;
}

// Dijkstra Shortest Path Search (least mileage)
SearchResult searchDijkstra(int startId, int targetId) {
    SearchResult result;
    result.method = "Dijkstra (Lowest Mileage)";
    
    map<int, int> dist;
    map<int, int> parent;
    map<int, bool> visited;
    for (auto w : warehouses) {
        dist[w->id] = 1e9;
    }
    dist[startId] = 0;

    // Custom priority queue pair: (distance, warehouse pointer)
    auto cmp = [](const pair<int, Warehouse*>& a, const pair<int, Warehouse*>& b) {
        return a.first > b.first;
    };
    priority_queue<pair<int, Warehouse*>, vector<pair<int, Warehouse*>>, decltype(cmp)> pq(cmp);
    
    Warehouse* start = nullptr;
    for (auto w : warehouses) { if (w->id == startId) start = w; }
    if (!start) return result;

    pq.push({0, start});

    while (!pq.empty()) {
        auto top = pq.top();
        pq.pop();
        int d = top.first;
        Warehouse* curr = top.second;

        if (visited[curr->id]) continue;
        visited[curr->id] = true;
        result.visitedNodes.push_back(curr->name);

        if (curr->id == targetId) break;

        for (auto edge : curr->connections) {
            Warehouse* neighbor = edge.first;
            int weight = edge.second;
            if (dist[curr->id] + weight < dist[neighbor->id]) {
                dist[neighbor->id] = dist[curr->id] + weight;
                parent[neighbor->id] = curr->id;
                pq.push({dist[neighbor->id], neighbor});
            }
        }
    }

    if (dist[targetId] < 1e9) {
        result.distance = dist[targetId];
        int curr = targetId;
        vector<int> revPath;
        while (curr != startId) {
            revPath.push_back(curr);
            curr = parent[curr];
        }
        revPath.push_back(startId);
        reverse(revPath.begin(), revPath.end());
        result.path = revPath;
    } else {
        result.distance = 0;
    }
    return result;
}

// Supplier Recommendation & Restocking calculation
vector<Supplier> getSuppliers(string category) {
    vector<Supplier> res;
    if (category == "Electronics") {
        res.push_back({"ElectroLink Supply Co", 450.0, 3, 0.95});
        res.push_back({"AsiaTech Distributors", 420.0, 7, 0.85});
        res.push_back({"Silicon Valley Logistics", 480.0, 1, 0.98});
    } else if (category == "Clothing") {
        res.push_back({"Global Fab Mills", 8.0, 5, 0.90});
        res.push_back({"Speedy Apparel Corp", 10.0, 2, 0.96});
        res.push_back({"Niche Styles Ltd", 7.5, 10, 0.80});
    } else { // Footwear
        res.push_back({"SoleCraft Leather Co", 60.0, 6, 0.92});
        res.push_back({"ActiveWare Shoes", 55.0, 8, 0.88});
        res.push_back({"StepEase Wholesale", 65.0, 3, 0.97});
    }
    return res;
}

// Dynamic Pricing Model
void applyDynamicPricing() {
    // Loop through catalog and compute pricing fluctuations
    time_t now = time(0);
    tm* ltm = localtime(&now);
    int hour = ltm->tm_hour;

    for (auto p : catalog) {
        double newPrice = p->basePrice;
        
        // 1. Demand factor (Popularity based)
        if (p->popularity > 80) {
            newPrice *= 1.10; // 10% premium for high demand
        } else if (p->popularity < 60) {
            newPrice *= 0.85; // 15% discount for low demand (overstock clearance)
        }

        // 2. Seasonal Surge: Holiday Hour Surge (between 6 PM and 10 PM)
        if (hour >= 18 && hour <= 22) {
            newPrice *= 1.05; // 5% peak demand surge
        }

        // 3. Flash Sale discount
        if (p->id == 6) { // T-shirt is in a heavy discount flash sale
            newPrice *= 0.60; 
        }

        p->price = newPrice;
    }
}

// Demand forecasting (daily, weekly, monthly)
struct Forecast {
    int productId;
    string productName;
    int dailyForecast;
    int weeklyForecast;
    int monthlyForecast;
    double accuracy;
};

vector<Forecast> calculateForecasts() {
    vector<Forecast> res;
    for (auto p : catalog) {
        Forecast f;
        f.productId = p->id;
        f.productName = p->name;
        
        // Base prediction model around popularity score and recent turnover rate
        int baseSales = 10 + (p->popularity / 3);
        f.dailyForecast = max(2, (int)(baseSales * p->turnoverRate / 7.0));
        f.weeklyForecast = max(10, (int)(baseSales * p->turnoverRate));
        f.monthlyForecast = max(40, (int)(baseSales * p->turnoverRate * 4.3));
        
        // Simulated accuracy metric
        f.accuracy = 85.0 + (p->id % 12);
        res.push_back(f);
    }
    return res;
}

// ==================== MULTI-LEVEL PRODUCT SORT (PS_05 Feature 7) ====================
// Order: category A→Z, then popularity high→low, then price low→high

bool multiLevelSort(const Product* a, const Product* b) {
    if (a->category != b->category) return a->category < b->category;
    if (a->popularity != b->popularity) return a->popularity > b->popularity;
    return a->price < b->price;
}

bool sortByCategoryOnly(const Product* a, const Product* b) {
    return a->category < b->category;
}

bool sortByPriceOnly(const Product* a, const Product* b) {
    return a->price < b->price;
}

string productToJson(Product* p) {
    return "{"
           "\"id\":" + to_string(p->id) + ","
           "\"name\":\"" + p->name + "\","
           "\"category\":\"" + p->category + "\","
           "\"basePrice\":" + to_string(p->basePrice) + ","
           "\"price\":" + to_string(p->price) + ","
           "\"popularity\":" + to_string(p->popularity) + ","
           "\"stock\":" + to_string(p->stock) + ","
           "\"maxStock\":" + to_string(p->maxStock) + ","
           "\"expiryDate\":\"" + p->expiryDate + "\","
           "\"rating\":" + to_string(p->rating) + ","
           "\"turnoverRate\":" + to_string(p->turnoverRate) +
           "}";
}

string catalogArrayToJson(const vector<Product*>& products) {
    string json = "[";
    for (size_t i = 0; i < products.size(); ++i) {
        json += productToJson(products[i]);
        if (i < products.size() - 1) json += ",";
    }
    json += "]";
    return json;
}

// ==================== PRICE-SORTED CATALOG & BINARY SEARCH (PS_05 Feature 8) ====================

void rebuildPriceSortedCatalog() {
    priceSortedCatalog = catalog;
    sort(priceSortedCatalog.begin(), priceSortedCatalog.end(), sortByPriceOnly);
}

void insertIntoPriceSortedCatalog(Product* p) {
    auto it = lower_bound(
        priceSortedCatalog.begin(), priceSortedCatalog.end(), p,
        [](Product* a, Product* b) { return a->price < b->price; });
    priceSortedCatalog.insert(it, p);
}

void eraseFromPriceSortedCatalog(Product* p) {
    for (auto it = priceSortedCatalog.begin(); it != priceSortedCatalog.end(); ++it) {
        if (*it == p) {
            priceSortedCatalog.erase(it);
            return;
        }
    }
}

// First index where price >= minPrice (std::lower_bound semantics)
int binarySearchPriceLower(double minPrice) {
    int lo = 0;
    int hi = (int)priceSortedCatalog.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (priceSortedCatalog[mid]->price < minPrice) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

// Last index where price <= maxPrice
int binarySearchPriceUpper(double maxPrice) {
    if (priceSortedCatalog.empty()) return -1;
    int lo = 0;
    int hi = (int)priceSortedCatalog.size() - 1;
    int ans = -1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (priceSortedCatalog[mid]->price <= maxPrice) {
            ans = mid;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return ans;
}

bool parseQueryParam(const string& path, const string& key, string& outVal) {
    string needle = key + "=";
    size_t pos = path.find(needle);
    if (pos == string::npos) return false;
    outVal = path.substr(pos + needle.length());
    size_t amp = outVal.find('&');
    if (amp != string::npos) outVal = outVal.substr(0, amp);
    return !outVal.empty();
}

// Parse ?sort=category|price from path; default is multi-level
string parseProductSortMode(const string& path) {
    size_t qPos = path.find("?sort=");
    if (qPos == string::npos) return "multi";
    string mode = path.substr(qPos + 6);
    size_t amp = mode.find('&');
    if (amp != string::npos) mode = mode.substr(0, amp);
    if (mode == "category" || mode == "price") return mode;
    return "multi";
}

// ==================== HTTP CLIENT THREAD FUNCTION ====================

void handleHttpClient(int client_fd) {
    char buffer[8192] = {0};
    int bytesRead = read(client_fd, buffer, sizeof(buffer) - 1);
    if (bytesRead <= 0) {
        close(client_fd);
        return;
    }

    string request(buffer);
    stringstream ss(request);
    string method, path, version;
    ss >> method >> path >> version;

    // Read JSON Body if POST or PUT request
    string body = "";
    size_t bodyPos = request.find("\r\n\r\n");
    if (bodyPos != string::npos) {
        body = request.substr(bodyPos + 4);
    }

    // CORS & Common Headers
    string headers = "HTTP/1.1 200 OK\r\n"
                     "Access-Control-Allow-Origin: *\r\n"
                     "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\r\n"
                     "Access-Control-Allow-Headers: Content-Type, Authorization\r\n"
                     "Content-Type: application/json\r\n"
                     "Connection: close\r\n\r\n";

    if (method == "OPTIONS") {
        write(client_fd, headers.c_str(), headers.length());
        close(client_fd);
        return;
    }

    lock_guard<mutex> lock(dbMutex);

    // Apply Dynamic Pricing calculations before handling products
    applyDynamicPricing();

    string responseBody = "{}";

    // --- API ROUTING ENGINE ---

    // 1. Authentication Route
    if (method == "POST" && path == "/api/auth/login") {
        string username = getJsonStringValue(body, "username");
        string password = getJsonStringValue(body, "password");

        if ((username == "admin" && password == "admin") || (username == "employee" && password == "employee")) {
            string role = (username == "admin") ? "Admin" : "Employee";
            responseBody = "{\"success\":true, \"username\":\"" + username + "\", \"role\":\"" + role + "\", \"token\":\"mock-token-" + role + "\"}";
        } else {
            responseBody = "{\"success\":false, \"message\":\"Invalid credentials. Use 'admin/admin' or 'employee/employee'\"}";
        }
    }
    // 2a. Products — price-range filter (binary search) or category filter
    else if (method == "GET" && path.rfind("/api/products/filter", 0) == 0) {
        rebuildPriceSortedCatalog();

        string categoryFilter, minStr, maxStr;
        bool hasCategory = parseQueryParam(path, "category", categoryFilter);
        bool hasMin = parseQueryParam(path, "minPrice", minStr);
        bool hasMax = parseQueryParam(path, "maxPrice", maxStr);

        vector<Product*> result;

        if (hasCategory && !hasMin && !hasMax) {
            for (auto p : catalog) {
                if (p->category == categoryFilter) result.push_back(p);
            }
        } else {
            double minPrice = hasMin ? stod(minStr) : 0.0;
            double maxPrice = hasMax ? stod(maxStr) : 1e12;

            int lo = binarySearchPriceLower(minPrice);
            int hi = binarySearchPriceUpper(maxPrice);

            if (lo < (int)priceSortedCatalog.size() && hi >= 0 && lo <= hi) {
                for (int i = lo; i <= hi; ++i) {
                    Product* p = priceSortedCatalog[i];
                    if (hasCategory && p->category != categoryFilter) continue;
                    result.push_back(p);
                }
            }
        }

        responseBody = catalogArrayToJson(result);
    }
    // 2b. Products — multi-level sorted listing (must precede generic /api/products prefix)
    else if (method == "GET" && path.rfind("/api/products/sorted", 0) == 0) {
        vector<Product*> sortedCatalog = catalog;
        string sortMode = parseProductSortMode(path);
        if (sortMode == "category") {
            sort(sortedCatalog.begin(), sortedCatalog.end(), sortByCategoryOnly);
        } else if (sortMode == "price") {
            sort(sortedCatalog.begin(), sortedCatalog.end(), sortByPriceOnly);
        } else {
            sort(sortedCatalog.begin(), sortedCatalog.end(), multiLevelSort);
        }
        responseBody = catalogArrayToJson(sortedCatalog);
    }
    // 2c. Products List (insertion order, unchanged)
    else if (method == "GET" && path == "/api/products") {
        responseBody = catalogArrayToJson(catalog);
    }
    // 3. Add Product
    else if (method == "POST" && path == "/api/products") {
        int id = catalog.empty() ? 1 : catalog.back()->id + 1;
        string name = getJsonStringValue(body, "name");
        string category = getJsonStringValue(body, "category");
        double price = getJsonDoubleValue(body, "price");
        int stock = getJsonIntValue(body, "stock");
        int maxStock = getJsonIntValue(body, "maxStock");
        if (maxStock <= 0) maxStock = stock * 2;
        string expiry = getJsonStringValue(body, "expiryDate");
        if (expiry.empty()) expiry = "2028-12-31";

        Product* p = new Product(id, name, category, price, 50, stock, maxStock, expiry, 4.0, 0.5);
        catalog.push_back(p);
        insert(productCatalogBST, p);
        insertIntoPriceSortedCatalog(p);

        // Auto synchronize into Main Warehouse inventory list
        if (!warehouses.empty()) {
            WarehouseNode* curr = warehouses[0]->inventory;
            WarehouseNode* prev = nullptr;
            bool found = false;
            while (curr != nullptr) {
                if (curr->productId == id) {
                    curr->quantity = stock;
                    found = true;
                    break;
                }
                prev = curr;
                curr = curr->next;
            }
            if (!found) {
                WarehouseNode* newNode = new WarehouseNode(id, stock);
                if (prev) prev->next = newNode;
                else warehouses[0]->inventory = newNode;
            }
        }

        responseBody = "{\"success\":true, \"message\":\"Product created!\", \"productId\":" + to_string(id) + "}";
    }
    // 4. Update Product
    else if (method == "PUT" && path.rfind("/api/products", 0) == 0) {
        int id = getJsonIntValue(body, "id");
        Product* p = searchById(productCatalogBST, id);

        if (p) {
            p->name = getJsonStringValue(body, "name");
            p->category = getJsonStringValue(body, "category");
            p->basePrice = getJsonDoubleValue(body, "price");
            p->stock = getJsonIntValue(body, "stock");
            p->maxStock = getJsonIntValue(body, "maxStock");
            string exp = getJsonStringValue(body, "expiryDate");
            if (!exp.empty()) p->expiryDate = exp;
            p->price = p->basePrice;

            // Re-sort price index after price/category change
            applyDynamicPricing();
            rebuildPriceSortedCatalog();

            // Sync with warehouse inventory
            for (auto w : warehouses) {
                WarehouseNode* curr = w->inventory;
                while (curr != nullptr) {
                    if (curr->productId == id) {
                        curr->quantity = p->stock / warehouses.size(); // evenly sync stock across warehouses
                        break;
                    }
                    curr = curr->next;
                }
            }

            responseBody = "{\"success\":true, \"message\":\"Product details updated!\"}";
        } else {
            responseBody = "{\"success\":false, \"message\":\"Product not found!\"}";
        }
    }
    // 5. Delete Product
    else if (method == "DELETE" && path.rfind("/api/products", 0) == 0) {
        // Query param parser (e.g. /api/products?id=3)
        size_t queryPos = path.find("?id=");
        int id = -1;
        if (queryPos != string::npos) {
            id = stoi(path.substr(queryPos + 4));
        }

        bool deleted = false;
        Product* p = searchById(productCatalogBST, id);
        if (p) {
            eraseFromPriceSortedCatalog(p);
            deleteNode(productCatalogBST, id);
            for (auto it = catalog.begin(); it != catalog.end(); ++it) {
                if ((*it)->id == id) {
                    delete *it;
                    catalog.erase(it);
                    deleted = true;
                    break;
                }
            }
        }

        if (deleted) {
            // Remove from warehouse inventory lists
            for (auto w : warehouses) {
                WarehouseNode* curr = w->inventory;
                WarehouseNode* prev = nullptr;
                while (curr != nullptr) {
                    if (curr->productId == id) {
                        if (prev) prev->next = curr->next;
                        else w->inventory = curr->next;
                        delete curr;
                        break;
                    }
                    prev = curr;
                    curr = curr->next;
                }
            }
            responseBody = "{\"success\":true, \"message\":\"Product deleted!\"}";
        } else {
            responseBody = "{\"success\":false, \"message\":\"Product not found!\"}";
        }
    }
    // 6. Warehouses List & Management
    else if (method == "GET" && path == "/api/warehouses") {
        responseBody = "[";
        for (size_t i = 0; i < warehouses.size(); ++i) {
            Warehouse* w = warehouses[i];
            
            // Total units calculation in list
            int total = 0;
            WarehouseNode* node = w->inventory;
            string invJson = "[";
            while (node != nullptr) {
                total += node->quantity;
                
                // Get product name (BST lookup by warehouse inventory productId)
                string pName = "Unknown";
                Product* p = searchById(productCatalogBST, node->productId);
                if (p) pName = p->name;
                
                invJson += "{\"productId\":" + to_string(node->productId) + 
                           ",\"name\":\"" + pName + "\",\"quantity\":" + to_string(node->quantity) + "}";
                node = node->next;
                if (node != nullptr) invJson += ",";
            }
            invJson += "]";

            w->capacity = 10000; // base capacity default
            responseBody += "{"
                            "\"id\":" + to_string(w->id) + ","
                            "\"name\":\"" + w->name + "\","
                            "\"location\":\"" + w->location + "\","
                            "\"totalStock\":" + to_string(total) + ","
                            "\"capacity\":" + to_string(w->capacity) + ","
                            "\"status\":\"" + w->status + "\","
                            "\"inventory\":" + invJson +
                            "}";
            if (i < warehouses.size() - 1) responseBody += ",";
        }
        responseBody += "]";
    }
    // 7. Add Warehouse
    else if (method == "POST" && path == "/api/warehouses") {
        int id = warehouses.empty() ? 1 : warehouses.back()->id + 1;
        string name = getJsonStringValue(body, "name");
        string location = getJsonStringValue(body, "location");
        int capacity = getJsonIntValue(body, "capacity");

        Warehouse* w = new Warehouse(id, name, location, capacity, "Active");
        
        // Auto connect to the Main Warehouse if it exists
        if (!warehouses.empty()) {
            warehouses[0]->connections.push_back({w, 350});
            w->connections.push_back({warehouses[0], 350});
        }
        warehouses.push_back(w);

        responseBody = "{\"success\":true, \"warehouseId\":" + to_string(id) + "}";
    }
    // 8. Delete Warehouse (Remove Warehouse)
    else if (method == "DELETE" && path.rfind("/api/warehouses", 0) == 0) {
        size_t queryPos = path.find("?id=");
        int id = -1;
        if (queryPos != string::npos) {
            id = stoi(path.substr(queryPos + 4));
        }

        bool deleted = false;
        for (auto it = warehouses.begin(); it != warehouses.end(); ++it) {
            if ((*it)->id == id) {
                // Clear linked inventory
                WarehouseNode* curr = (*it)->inventory;
                while (curr != nullptr) {
                    WarehouseNode* tmp = curr;
                    curr = curr->next;
                    delete tmp;
                }
                
                // Clear connections in graph
                for (auto w : warehouses) {
                    auto& conn = w->connections;
                    conn.erase(remove_if(conn.begin(), conn.end(), [id](const pair<Warehouse*, int>& edge) {
                        return edge.first->id == id;
                    }), conn.end());
                }

                delete *it;
                warehouses.erase(it);
                deleted = true;
                break;
            }
        }

        if (deleted) {
            responseBody = "{\"success\":true, \"message\":\"Warehouse removed successfully!\"}";
        } else {
            responseBody = "{\"success\":false, \"message\":\"Warehouse not found!\"}";
        }
    }
    // 9. Shortest Path & Route Optimization & Transport cost Analysis
    else if (method == "GET" && path.rfind("/api/warehouses/shortest-path", 0) == 0) {
        // Query params parser: /api/warehouses/shortest-path?from=1&to=3&algo=Dijkstra
        size_t fromPos = path.find("from=");
        size_t toPos = path.find("to=");
        size_t algoPos = path.find("algo=");

        int fromId = 1, toId = 3;
        string algo = "Dijkstra";

        if (fromPos != string::npos) fromId = stoi(path.substr(fromPos + 5));
        if (toPos != string::npos) toId = stoi(path.substr(toPos + 3));
        if (algoPos != string::npos) {
            size_t endAlgo = path.find("&", algoPos);
            if (endAlgo != string::npos) {
                algo = path.substr(algoPos + 5, endAlgo - algoPos - 5);
            } else {
                algo = path.substr(algoPos + 5);
            }
        }

        SearchResult searchRes;
        if (algo == "BFS") {
            searchRes = searchBFS(fromId, toId);
        } else if (algo == "DFS") {
            searchRes = searchDFS(fromId, toId);
        } else {
            searchRes = searchDijkstra(fromId, toId);
        }

        // Transport Cost Analysis calculation
        double cargoTruckCost = searchRes.distance * 0.15;
        double expressCourierCost = searchRes.distance * 0.45;
        double airFreightCost = searchRes.distance * 1.20;

        string pathStr = "[";
        for (size_t i = 0; i < searchRes.path.size(); ++i) {
            pathStr += to_string(searchRes.path[i]);
            if (i < searchRes.path.size() - 1) pathStr += ",";
        }
        pathStr += "]";

        string visitedStr = "[";
        for (size_t i = 0; i < searchRes.visitedNodes.size(); ++i) {
            visitedStr += "\"" + searchRes.visitedNodes[i] + "\"";
            if (i < searchRes.visitedNodes.size() - 1) visitedStr += ",";
        }
        visitedStr += "]";

        responseBody = "{"
                       "\"success\":" + string(searchRes.path.empty() ? "false" : "true") + ","
                       "\"method\":\"" + searchRes.method + "\","
                       "\"distance\":" + to_string(searchRes.distance) + ","
                       "\"path\":" + pathStr + ","
                       "\"visited\":" + visitedStr + ","
                       "\"costs\":{"
                         "\"cargoTruck\":" + to_string(cargoTruckCost) + ","
                         "\"expressCourier\":" + to_string(expressCourierCost) + ","
                         "\"airFreight\":" + to_string(airFreightCost) +
                       "}"
                       "}";
    }
    // 10. Transfer Stock Between Warehouses (Warehouse Sync)
    else if (method == "POST" && path == "/api/warehouses/transfer") {
        int fromId = getJsonIntValue(body, "fromWarehouseId");
        int toId = getJsonIntValue(body, "toWarehouseId");
        int productId = getJsonIntValue(body, "productId");
        int quantity = getJsonIntValue(body, "quantity");

        Warehouse* fromW = nullptr;
        Warehouse* toW = nullptr;
        for (auto w : warehouses) {
            if (w->id == fromId) fromW = w;
            if (w->id == toId) toW = w;
        }

        if (fromW && toW) {
            // Deduct from sender
            WarehouseNode* curr = fromW->inventory;
            bool deducted = false;
            while (curr != nullptr) {
                if (curr->productId == productId) {
                    if (curr->quantity >= quantity) {
                        curr->quantity -= quantity;
                        deducted = true;
                    }
                    break;
                }
                curr = curr->next;
            }

            if (deducted) {
                // Add to recipient (Linked list insert/update)
                curr = toW->inventory;
                WarehouseNode* prev = nullptr;
                bool added = false;
                while (curr != nullptr) {
                    if (curr->productId == productId) {
                        curr->quantity += quantity;
                        added = true;
                        break;
                    }
                    prev = curr;
                    curr = curr->next;
                }

                if (!added) {
                    WarehouseNode* newNode = new WarehouseNode(productId, quantity);
                    if (prev) prev->next = newNode;
                    else toW->inventory = newNode;
                }

                responseBody = "{\"success\":true, \"message\":\"Stock successfully synchronized across hubs!\"}";
            } else {
                responseBody = "{\"success\":false, \"message\":\"Insufficient source warehouse stock!\"}";
            }
        } else {
            responseBody = "{\"success\":false, \"message\":\"Source or Target warehouse invalid!\"}";
        }
    }
    // 11. Shopping Cart API
    else if (method == "GET" && path == "/api/cart") {
        responseBody = "[";
        for (size_t i = 0; i < activeCart.size(); ++i) {
            CartItem* item = activeCart[i];
            responseBody += "{"
                            "\"id\":" + to_string(item->productId) + ","
                            "\"name\":\"" + item->name + "\","
                            "\"category\":\"" + item->category + "\","
                            "\"price\":" + to_string(item->price) + ","
                            "\"quantity\":" + to_string(item->quantity) + ","
                            "\"stock\":" + to_string(item->stock) + ","
                            "\"image\":\"" + item->image + "\""
                            "}";
            if (i < activeCart.size() - 1) responseBody += ",";
        }
        responseBody += "]";
    }
    else if (method == "POST" && path == "/api/cart/add") {
        int productId = getJsonIntValue(body, "productId");
        int quantity = getJsonIntValue(body, "quantity");
        if (quantity <= 0) quantity = 1;

        Product* p = searchById(productCatalogBST, productId);

        if (p) {
            // Save state to Undo stack
            cartUndoStack.push(activeCart);
            // Clear redo stack
            while (!cartRedoStack.empty()) cartRedoStack.pop();

            // Append or update cart item
            bool found = false;
            for (auto item : activeCart) {
                if (item->productId == productId) {
                    item->quantity += quantity;
                    found = true;
                    break;
                }
            }

            if (!found) {
                string image = (p->category == "Electronics") ? "💻" : (p->category == "Clothing") ? "👕" : "👟";
                activeCart.push_back(new CartItem(p->id, p->name, p->category, p->price, quantity, p->stock, image));
            }

            responseBody = "{\"success\":true, \"message\":\"Item added to stack!\"}";
        } else {
            responseBody = "{\"success\":false, \"message\":\"Product not found!\"}";
        }
    }
    else if (method == "POST" && path == "/api/cart/undo") {
        if (!cartUndoStack.empty()) {
            cartRedoStack.push(activeCart);
            activeCart = cartUndoStack.top();
            cartUndoStack.pop();
            responseBody = "{\"success\":true, \"message\":\"Stack Undo operation performed!\"}";
        } else {
            responseBody = "{\"success\":false, \"message\":\"Nothing to undo on stack!\"}";
        }
    }
    else if (method == "POST" && path == "/api/cart/redo") {
        if (!cartRedoStack.empty()) {
            cartUndoStack.push(activeCart);
            activeCart = cartRedoStack.top();
            cartRedoStack.pop();
            responseBody = "{\"success\":true, \"message\":\"Stack Redo operation performed!\"}";
        } else {
            responseBody = "{\"success\":false, \"message\":\"Nothing to redo on stack!\"}";
        }
    }
    // 12. Checkout queue & Customer registration (priority_queue: loyalty first)
    else if (method == "GET" && path == "/api/checkout/queue") {
        // priority_queue is not iterable — snapshot and sort by priority for display
        vector<pair<int, int>> queueSnapshot;
        priority_queue<pair<int, int>, vector<pair<int, int>>, less<pair<int, int>>> tempPQ = checkoutQueue;
        while (!tempPQ.empty()) {
            queueSnapshot.push_back(tempPQ.top());
            tempPQ.pop();
        }
        sort(queueSnapshot.begin(), queueSnapshot.end(), [](const pair<int, int>& a, const pair<int, int>& b) {
            if (a.first != b.first) return a.first > b.first;
            return a.second < b.second;
        });

        responseBody = "[";
        int pos = 1;
        for (size_t i = 0; i < queueSnapshot.size(); ++i) {
            int priorityScore = queueSnapshot[i].first;
            int cid = queueSnapshot[i].second;

            Customer* c = nullptr;
            for (auto item : customers) { if (item->id == cid) c = item; }

            if (c) {
                int waitTime = pos * 4;
                responseBody += "{"
                                "\"id\":" + to_string(c->id) + ","
                                "\"name\":\"" + c->name + "\","
                                "\"isLoyaltyMember\":" + string(c->isLoyaltyMember ? "true" : "false") + ","
                                "\"priorityScore\":" + to_string(priorityScore) + ","
                                "\"cartTotal\":" + to_string(pos * 189.99) + ","
                                "\"items\":" + to_string(2 + pos) + ","
                                "\"waitTime\":\"" + to_string(waitTime) + " min\""
                                "}";
                pos++;
                if (i < queueSnapshot.size() - 1) responseBody += ",";
            }
        }
        responseBody += "]";
    }
    else if (method == "POST" && path == "/api/checkout/enqueue") {
        string name = getJsonStringValue(body, "name");
        bool isLoyalty = getJsonBoolValue(body, "isLoyaltyMember");

        int cid = customers.empty() ? 1 : customers.back()->id + 1;
        Customer* c = new Customer(cid, name, isLoyalty);
        customers.push_back(c);

        int priority = isLoyalty ? 1 : 0;
        checkoutQueue.push({priority, cid});

        responseBody = "{\"success\":true, \"message\":\"Enqueued!\", \"id\":" + to_string(cid) + ","
                       "\"priorityScore\":" + to_string(priority) + "}";
    }
    else if (method == "POST" && path == "/api/checkout/dequeue") {
        // Pop highest-priority customer (loyalty VIPs served before regular)
        if (!checkoutQueue.empty()) {
            int cid = checkoutQueue.top().second;
            checkoutQueue.pop();

            Customer* c = nullptr;
            for (auto item : customers) { if (item->id == cid) c = item; }

            if (c) {
                // Build billing simulation invoice
                double subtotal = 0;
                string receiptItems = "";
                
                // If checking out active cart
                if (!activeCart.empty()) {
                    for (auto item : activeCart) {
                        subtotal += item->price * item->quantity;
                        receiptItems += to_string(item->quantity) + "x " + item->name + " (₹" + to_string(item->price) + " each) ";
                        
                        // Deduct product stock (BST lookup by cart item productId)
                        Product* p = searchById(productCatalogBST, item->productId);
                        if (p) {
                            p->stock = max(0, p->stock - item->quantity);
                        }
                    }
                    activeCart.clear();
                } else {
                    subtotal = 379.98; // fallback mock
                    receiptItems = "2x Wireless Mouse, 1x Headphones";
                }

                // Loyalty discount
                double discount = c->isLoyaltyMember ? (subtotal * 0.10) : 0.0;
                double tax = (subtotal - discount) * 0.08;
                double total = subtotal - discount + tax;

                string receipt = "Invoice #" + to_string(1000 + rand() % 9000) + " - " + receiptItems + 
                                 " | Subtotal: ₹" + to_string(subtotal) + 
                                 " | Discount: ₹" + to_string(discount) + 
                                 " | Tax: ₹" + to_string(tax) + 
                                 " | Total Paid: ₹" + to_string(total);

                c->purchaseHistory.push_back(receipt);

                responseBody = "{"
                               "\"success\":true,"
                               "\"customerId\":" + to_string(c->id) + ","
                               "\"name\":\"" + c->name + "\","
                               "\"isLoyaltyMember\":" + string(c->isLoyaltyMember ? "true" : "false") + ","
                               "\"receipt\":\"" + receipt + "\","
                               "\"subtotal\":" + to_string(subtotal) + ","
                               "\"discount\":" + to_string(discount) + ","
                               "\"tax\":" + to_string(tax) + ","
                               "\"total\":" + to_string(total) +
                               "}";
            }
        } else {
            responseBody = "{\"success\":false, \"message\":\"Queue is empty!\"}";
        }
    }
    // 13. Smart Alert System (Expiry, Overstock, Demand Spike Alerts)
    else if (method == "GET" && path == "/api/alerts") {
        responseBody = "[";
        vector<string> alerts;

        time_t t = time(0);
        tm* now = localtime(&t);
        int currentYear = now->tm_year + 1900;
        int currentMonth = now->tm_mon + 1;

        for (auto p : catalog) {
            // 1. Expiry alerts (Expiring soon - within 6 months of current 2026 calendar)
            if (p->expiryDate.substr(0, 4) == "2026") {
                alerts.push_back("{\"id\":" + to_string(p->id) + 
                                 ",\"type\":\"EXPIRY\"" +
                                 ",\"productName\":\"" + p->name + "\"" +
                                 ",\"message\":\"Perishable threat: product expires soon on " + p->expiryDate + "\"" +
                                 ",\"severity\":\"CRITICAL\"}");
            }
            // 2. Overstock Alert (Stock exceeds 80% of maxStock)
            if (p->stock >= p->maxStock * 0.8) {
                alerts.push_back("{\"id\":" + to_string(p->id) + 
                                 ",\"type\":\"OVERSTOCK\"" +
                                 ",\"productName\":\"" + p->name + "\"" +
                                 ",\"message\":\"Storage overcapacity: Stock level is at " + to_string(p->stock) + " units (max: " + to_string(p->maxStock) + ")\"" +
                                 ",\"severity\":\"WARNING\"}");
            }
            // 3. Demand Spike Alert (Popularity spikes above 90)
            if (p->popularity >= 92) {
                alerts.push_back("{\"id\":" + to_string(p->id) + 
                                 ",\"type\":\"SPIKE\"" +
                                 ",\"productName\":\"" + p->name + "\"" +
                                 ",\"message\":\"Demand surge: High sales spike expected due to high rating and popularity (" + to_string(p->popularity) + "%)\"" +
                                 ",\"severity\":\"INFO\"}");
            }
            // 4. Low stock
            if (p->stock < 50) {
                alerts.push_back("{\"id\":" + to_string(p->id) + 
                                 ",\"type\":\"LOW_STOCK\"" +
                                 ",\"productName\":\"" + p->name + "\"" +
                                 ",\"message\":\"Understock risk: only " + to_string(p->stock) + " units remaining.\"" +
                                 ",\"severity\":\"CRITICAL\"}");
            }
        }

        for (size_t i = 0; i < alerts.size(); ++i) {
            responseBody += alerts[i];
            if (i < alerts.size() - 1) responseBody += ",";
        }
        responseBody += "]";
    }
    // 14. Restocking Report Generator (Greedy algorithm + Supplier recommendations)
    else if (method == "GET" && path.rfind("/api/restock", 0) == 0) {
        // Greedy algorithm to maximize restocking under a budget
        double budget = 8000.0;
        size_t bPos = path.find("budget=");
        if (bPos != string::npos) {
            budget = stod(path.substr(bPos + 7));
        }

        struct PurchaseCandidate {
            Product* p;
            Supplier bestSupplier;
            double priorityScore; // turnoverRate / cost
        };

        vector<PurchaseCandidate> candidates;
        for (auto p : catalog) {
            if (p->stock < p->maxStock * 0.6) { // candidates for restocking
                vector<Supplier> sups = getSuppliers(p->category);
                if (sups.empty()) continue;
                
                // Select best supplier greedily by lowest unit cost
                Supplier best = sups[0];
                for (auto s : sups) {
                    if (s.costPerUnit < best.costPerUnit) best = s;
                }
                
                double score = p->turnoverRate / best.costPerUnit;
                candidates.push_back({p, best, score});
            }
        }

        // Greedy allocation order: highest turnover/cost ratio first
        sort(candidates.begin(), candidates.end(), [](const PurchaseCandidate& a, const PurchaseCandidate& b) {
            return a.priorityScore > b.priorityScore;
        });

        struct RestockLine {
            Product* p;
            Supplier bestSupplier;
            int orderQty;
            double totalCost;
            double priorityScore;
        };

        vector<RestockLine> lines;
        double remainingBudget = budget;
        for (size_t i = 0; i < candidates.size(); ++i) {
            auto cand = candidates[i];
            int orderQty = cand.p->maxStock - cand.p->stock;
            double totalCost = orderQty * cand.bestSupplier.costPerUnit;

            if (totalCost > remainingBudget) {
                orderQty = (int)(remainingBudget / cand.bestSupplier.costPerUnit);
                totalCost = orderQty * cand.bestSupplier.costPerUnit;
            }

            if (orderQty > 0) {
                remainingBudget -= totalCost;
                lines.push_back({cand.p, cand.bestSupplier, orderQty, totalCost, cand.priorityScore});
            }
        }

        // P3 display order: category → popularity → price (groups high-priority items per category)
        sort(lines.begin(), lines.end(), [](const RestockLine& a, const RestockLine& b) {
            return multiLevelSort(a.p, b.p);
        });

        responseBody = "[";
        for (size_t i = 0; i < lines.size(); ++i) {
            const RestockLine& line = lines[i];
            responseBody += "{"
                            "\"productId\":" + to_string(line.p->id) + ","
                            "\"productName\":\"" + line.p->name + "\","
                            "\"category\":\"" + line.p->category + "\","
                            "\"unitsToOrder\":" + to_string(line.orderQty) + ","
                            "\"recommendedSupplier\":\"" + line.bestSupplier.name + "\","
                            "\"unitCost\":" + to_string(line.bestSupplier.costPerUnit) + ","
                            "\"totalCost\":" + to_string(line.totalCost) + ","
                            "\"deliveryDays\":" + to_string(line.bestSupplier.deliveryDays) + ","
                            "\"reliabilityScore\":" + to_string(line.bestSupplier.reliabilityScore) + ","
                            "\"priority\":" + to_string(line.priorityScore * 100.0) +
                            "}";
            if (i < lines.size() - 1) responseBody += ",";
        }
        responseBody += "]";
    }
    // 15. Demand Forecasting & Accuracy Metrics
    else if (method == "GET" && path == "/api/forecast") {
        vector<Forecast> forecasts = calculateForecasts();
        responseBody = "[";
        for (size_t i = 0; i < forecasts.size(); ++i) {
            Forecast f = forecasts[i];
            responseBody += "{"
                            "\"productId\":" + to_string(f.productId) + ","
                            "\"productName\":\"" + f.productName + "\","
                            "\"dailyForecast\":" + to_string(f.dailyForecast) + ","
                            "\"weeklyForecast\":" + to_string(f.weeklyForecast) + ","
                            "\"monthlyForecast\":" + to_string(f.monthlyForecast) + ","
                            "\"accuracy\":" + to_string(f.accuracy) +
                            "}";
            if (i < forecasts.size() - 1) responseBody += ",";
        }
        responseBody += "]";
    }
    // 16. Customer Loyalty & Database list
    else if (method == "GET" && path == "/api/customers") {
        responseBody = "[";
        for (size_t i = 0; i < customers.size(); ++i) {
            Customer* c = customers[i];
            
            // Build purchases history list in JSON
            string historyJson = "[";
            for (size_t j = 0; j < c->purchaseHistory.size(); ++j) {
                historyJson += "\"" + c->purchaseHistory[j] + "\"";
                if (j < c->purchaseHistory.size() - 1) historyJson += ",";
            }
            historyJson += "]";

            responseBody += "{"
                            "\"id\":" + to_string(c->id) + ","
                            "\"name\":\"" + c->name + "\","
                            "\"isLoyaltyMember\":" + string(c->isLoyaltyMember ? "true" : "false") + ","
                            "\"registrationDate\":\"" + c->registrationDate + "\","
                            "\"purchaseHistory\":" + historyJson +
                            "}";
            if (i < customers.size() - 1) responseBody += ",";
        }
        responseBody += "]";
    }
    else if (method == "POST" && path == "/api/customers") {
        string name = getJsonStringValue(body, "name");
        bool isLoyalty = getJsonBoolValue(body, "isLoyaltyMember");

        int id = customers.empty() ? 1 : customers.back()->id + 1;
        Customer* c = new Customer(id, name, isLoyalty, "2026-05-21");
        customers.push_back(c);

        responseBody = "{\"success\":true, \"customerId\":" + to_string(id) + "}";
    }

    // --- CONSTRUCT HTTP RESPONSE & SEND ---
    string response = headers + responseBody;
    write(client_fd, response.c_str(), response.length());
    close(client_fd);
}

// ==================== MAIN SERVER INITIALIZER ====================

int main() {
    // Populate Initial Mock Database States
    initializeDB();

    // Create server listening socket
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        cerr << "Failed to create socket!" << endl;
        return 1;
    }

    int opt = 1;
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
        cerr << "setsockopt REUSEADDR failed!" << endl;
        return 1;
    }

    sockaddr_in address;
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(8080);

    if (::bind(server_fd, (struct sockaddr*)&address, sizeof(address)) < 0) {
        cerr << "Bind failed on port 8080! Retrying soon..." << endl;
        return 1;
    }

    if (listen(server_fd, 100) < 0) {
        cerr << "Listen failed!" << endl;
        return 1;
    }

    cout << "\n=========================================" << endl;
    cout << "  E-COMMERCE INVENTORY C++ BACKEND ONLINE  " << endl;
    cout << "  Port: 8080  |  CORS Enabled  |  Standard POSIX  " << endl;
    cout << "=========================================" << endl;

    while (true) {
        int client_fd = accept(server_fd, nullptr, nullptr);
        if (client_fd >= 0) {
            // Spawn separate thread for each connection to prevent blocking requests!
            thread t(handleHttpClient, client_fd);
            t.detach();
        }
    }

    close(server_fd);
    return 0;
}

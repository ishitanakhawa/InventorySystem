#include <iostream>
#include <vector>
#include <string>
#include <stack>
#include <queue>
#include <algorithm>
#include <map>
#include <ctime>
#include <cmath>
using namespace std;


// Product Structure
struct Product {
    int id;
    string name;
    string category;
    double price;
    int popularity;
    int stock;
    
    Product(int i, string n, string c, double p, int pop, int s) 
        : id(i), name(n), category(c), price(p), popularity(pop), stock(s) {}
};

// BST Node for Product Catalog
struct BSTNode {
    Product* product;
    BSTNode* left;
    BSTNode* right;
    
    BSTNode(Product* p) : product(p), left(nullptr), right(nullptr) {}
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
    WarehouseNode* inventory;
    vector<Warehouse*> connections;
    
    Warehouse(int i, string n) : id(i), name(n), inventory(nullptr) {}
};

// Cart Item for Stack
struct CartItem {
    Product* product;
    int quantity;
    time_t timestamp;
    
    CartItem(Product* p, int qty) : product(p), quantity(qty), timestamp(time(0)) {}
};

// Customer for Checkout Queue
struct Customer {
    int id;
    string name;
    bool isLoyaltyMember;
    vector<CartItem*> cart;
    
    Customer(int i, string n, bool loyalty) : id(i), name(n), isLoyaltyMember(loyalty) {}
};

// ==================== BST FOR PRODUCT CATALOG ====================
class ProductCatalog {
private:
    BSTNode* root;
    
    BSTNode* insert(BSTNode* node, Product* product) {
        if (node == nullptr) return new BSTNode(product);
        
        if (product->id < node->product->id)
            node->left = insert(node->left, product);
        else if (product->id > node->product->id)
            node->right = insert(node->right, product);
        
        return node;
    }
    
    BSTNode* search(BSTNode* node, int id) {
        if (node == nullptr || node->product->id == id)
            return node;
        
        if (id < node->product->id)
            return search(node->left, id);
        
        return search(node->right, id);
    }
    
    void inorder(BSTNode* node, vector<Product*>& products) {
        if (node == nullptr) return;
        inorder(node->left, products);
        products.push_back(node->product);
        inorder(node->right, products);
    }
    
public:
    ProductCatalog() : root(nullptr) {}
    
    void addProduct(Product* product) {
        root = insert(root, product);
    }
    
    Product* getProduct(int id) {
        BSTNode* node = search(root, id);
        return node ? node->product : nullptr;
    }
    
    vector<Product*> getAllProducts() {
        vector<Product*> products;
        inorder(root, products);
        return products;
    }
    
    // Binary search on price range
    vector<Product*> getProductsByPriceRange(double minPrice, double maxPrice) {
        vector<Product*> allProducts = getAllProducts();
        vector<Product*> result;
        
        for (Product* p : allProducts) {
            if (p->price >= minPrice && p->price <= maxPrice) {
                result.push_back(p);
            }
        }
        
        return result;
    }
};

// ==================== WAREHOUSE INVENTORY (LINKED LIST) ====================
class WarehouseInventory {
private:
    WarehouseNode* head;
    
public:
    WarehouseInventory() : head(nullptr) {}
    
    void addStock(int productId, int quantity) {
        WarehouseNode* newNode = new WarehouseNode(productId, quantity);
        newNode->next = head;
        head = newNode;
    }
    
    int getStock(int productId) {
        WarehouseNode* current = head;
        while (current != nullptr) {
            if (current->productId == productId)
                return current->quantity;
            current = current->next;
        }
        return 0;
    }
    
    void updateStock(int productId, int quantity) {
        WarehouseNode* current = head;
        while (current != nullptr) {
            if (current->productId == productId) {
                current->quantity = quantity;
                return;
            }
            current = current->next;
        }
    }
    
    vector<pair<int, int>> getAllStock() {
        vector<pair<int, int>> stock;
        WarehouseNode* current = head;
        while (current != nullptr) {
            stock.push_back({current->productId, current->quantity});
            current = current->next;
        }
        return stock;
    }
};

// ==================== WAREHOUSE GRAPH ====================
class WarehouseNetwork {
private:
    vector<Warehouse*> warehouses;
    
public:
    void addWarehouse(int id, string name) {
        warehouses.push_back(new Warehouse(id, name));
    }
    
    Warehouse* getWarehouse(int id) {
        for (Warehouse* w : warehouses) {
            if (w->id == id) return w;
        }
        return nullptr;
    }
    
    void connectWarehouses(int id1, int id2) {
        Warehouse* w1 = getWarehouse(id1);
        Warehouse* w2 = getWarehouse(id2);
        if (w1 && w2) {
            w1->connections.push_back(w2);
            w2->connections.push_back(w1);
        }
    }
    
    vector<Warehouse*> getAllWarehouses() {
        return warehouses;
    }
};

class ShoppingCart {
private:
    stack<CartItem*> cartStack;
    stack<CartItem*> undoStack;
    
public:
    void addToCart(Product* product, int quantity) {
        CartItem* item = new CartItem(product, quantity);
        cartStack.push(item);
        cout << "Added: " << product->name << " (Qty: " << quantity << ")" << endl;
    }
    
    void undoAdd() {
        if (!cartStack.empty()) {
            CartItem* item = cartStack.top();
            cartStack.pop();
            undoStack.push(item);
            cout << "Undone: " << item->product->name << endl;
        } else {
            cout << "Cart is empty, nothing to undo!" << endl;
        }
    }
    
    void redoAdd() {
        if (!undoStack.empty()) {
            CartItem* item = undoStack.top();
            undoStack.pop();
            cartStack.push(item);
            cout << "Redone: " << item->product->name << endl;
        } else {
            cout << "Nothing to redo!" << endl;
        }
    }
    
    vector<CartItem*> getCartItems() {
        vector<CartItem*> items;
        stack<CartItem*> temp = cartStack;
        while (!temp.empty()) {
            items.push_back(temp.top());
            temp.pop();
        }
        return items;
    }
    
    double getTotal() {
        double total = 0;
        stack<CartItem*> temp = cartStack;
        while (!temp.empty()) {
            total += temp.top()->product->price * temp.top()->quantity;
            temp.pop();
        }
        return total;
    }
    
    void clearCart() {
        while (!cartStack.empty()) {
            delete cartStack.top();
            cartStack.pop();
        }
        while (!undoStack.empty()) {
            delete undoStack.top();
            undoStack.pop();
        }
    }
};

// ==================== CHECKOUT QUEUE (PRIORITY QUEUE) ====================
class CheckoutQueue {
private:
    struct CompareCustomer {
        bool operator()(Customer* a, Customer* b) {
            // Loyalty members have priority
            if (a->isLoyaltyMember && !b->isLoyaltyMember) return true;
            if (!a->isLoyaltyMember && b->isLoyaltyMember) return false;
            return false;
        }
    };
    
    priority_queue<Customer*, vector<Customer*>, CompareCustomer> queue;
    
public:
    void enqueue(Customer* customer) {
        queue.push(customer);
        cout << "Enqueued: " << customer->name 
             << (customer->isLoyaltyMember ? " (Loyalty Member)" : "") << endl;
    }
    
    Customer* dequeue() {
        if (queue.empty()) return nullptr;
        Customer* customer = queue.top();
        queue.pop();
        return customer;
    }
    
    bool isEmpty() {
        return queue.empty();
    }
    
    int size() {
        return queue.size();
    }
};

// ==================== DEMAND FORECASTING ====================
class DemandForecaster {
private:
    map<int, vector<int>> historicalData; // productId -> monthly sales
    
public:
    void addHistoricalData(int productId, vector<int> monthlySales) {
        historicalData[productId] = monthlySales;
    }
    
    double calculateAverageDemand(int productId) {
        if (historicalData.find(productId) == historicalData.end()) return 0;
        
        vector<int> data = historicalData[productId];
        double sum = 0;
        for (int sales : data) {
            sum += sales;
        }
        return sum / data.size();
    }
    
    double forecastDemand(int productId, int month) {
        double avgDemand = calculateAverageDemand(productId);
        
        // Seasonality factor (simple implementation)
        double seasonalityFactor = 1.0;
        if (month >= 11 || month <= 1) seasonalityFactor = 1.5; // Holiday season
        else if (month >= 6 && month <= 8) seasonalityFactor = 1.2; // Summer
        
        return avgDemand * seasonalityFactor;
    }
    
    bool isLowStockAlert(Product* product, int currentStock, int month) {
        double forecast = forecastDemand(product->id, month);
        return currentStock < forecast * 0.3; // Alert if stock < 30% of forecast
    }
};

// ==================== RESTOCKING (GREEDY ALGORITHM) ====================
class RestockingSystem {
private:
    struct RestockItem {
        int productId;
        double turnoverRate;
        double storageCost;
        double priority;
        
        RestockItem(int pid, double tr, double sc) 
            : productId(pid), turnoverRate(tr), storageCost(sc) {
            priority = turnoverRate * storageCost;
        }
    };
    
public:
    vector<pair<int, int>> calculateRestockOrder(vector<Product*> products, 
                                                  map<int, double> turnoverRates,
                                                  map<int, double> storageCosts,
                                                  int budget) {
        vector<RestockItem> items;
        
        for (Product* p : products) {
            double tr = turnoverRates[p->id];
            double sc = storageCosts[p->id];
            items.push_back(RestockItem(p->id, tr, sc));
        }
        
        // Sort by priority (greedy approach)
        sort(items.begin(), items.end(), 
             [](const RestockItem& a, const RestockItem& b) {
                 return a.priority > b.priority;
             });
        
        vector<pair<int, int>> restockOrder;
        int remainingBudget = budget;
        
        for (RestockItem& item : items) {
            int quantity = min(100, remainingBudget / 10); // Assume $10 per unit
            if (quantity > 0) {
                restockOrder.push_back({item.productId, quantity});
                remainingBudget -= quantity * 10;
            }
        }
        
        return restockOrder;
    }
};


class ProductSorter {
public:
    static vector<Product*> sortByCategoryPopularityPrice(vector<Product*> products) {
        sort(products.begin(), products.end(), 
             [](Product* a, Product* b) {
                 // Level 1: Category
                 if (a->category != b->category)
                     return a->category < b->category;
                 // Level 2: Popularity (descending)
                 if (a->popularity != b->popularity)
                     return a->popularity > b->popularity;
                 // Level 3: Price (ascending)
                 return a->price < b->price;
             });
        return products;
    }
};


class ECommerceSystem {
private:
    ProductCatalog catalog;
    WarehouseNetwork warehouseNetwork;
    ShoppingCart cart;
    CheckoutQueue checkoutQueue;
    DemandForecaster forecaster;
    RestockingSystem restockingSystem;
    
public:
    void initializeSampleData() {
        // Add products
        catalog.addProduct(new Product(1, "Laptop", "Electronics", 999.99, 85, 50));
        catalog.addProduct(new Product(2, "Mouse", "Electronics", 29.99, 90, 200));
        catalog.addProduct(new Product(3, "Keyboard", "Electronics", 79.99, 88, 150));
        catalog.addProduct(new Product(4, "Monitor", "Electronics", 349.99, 75, 80));
        catalog.addProduct(new Product(5, "Headphones", "Electronics", 149.99, 82, 120));
        catalog.addProduct(new Product(6, "T-Shirt", "Clothing", 19.99, 95, 300));
        catalog.addProduct(new Product(7, "Jeans", "Clothing", 59.99, 80, 180));
        catalog.addProduct(new Product(8, "Jacket", "Clothing", 89.99, 70, 100));
        catalog.addProduct(new Product(9, "Sneakers", "Footwear", 129.99, 88, 150));
        catalog.addProduct(new Product(10, "Boots", "Footwear", 159.99, 65, 90));
        
        // Add warehouses
        warehouseNetwork.addWarehouse(1, "Main Warehouse");
        warehouseNetwork.addWarehouse(2, "East Coast Hub");
        warehouseNetwork.addWarehouse(3, "West Coast Hub");
        
        // Connect warehouses
        warehouseNetwork.connectWarehouses(1, 2);
        warehouseNetwork.connectWarehouses(1, 3);
        warehouseNetwork.connectWarehouses(2, 3);
        
        // Add historical data for forecasting
        forecaster.addHistoricalData(1, {45, 52, 48, 60, 55, 70, 65, 72, 68, 75, 90, 95});
        forecaster.addHistoricalData(2, {120, 135, 128, 140, 132, 150, 145, 155, 148, 160, 180, 195});
    }
    
    void displayProducts() {
        cout << "\n=== PRODUCT CATALOG ===" << endl;
        vector<Product*> products = catalog.getAllProducts();
        for (Product* p : products) {
            cout << "ID: " << p->id << " | " << p->name 
                 << " | " << p->category << " | $" << p->price 
                 << " | Popularity: " << p->popularity 
                 << " | Stock: " << p->stock << endl;
        }
    }
    
    void displaySortedProducts() {
        cout << "\n=== SORTED PRODUCTS (Category -> Popularity -> Price) ===" << endl;
        vector<Product*> products = catalog.getAllProducts();
        products = ProductSorter::sortByCategoryPopularityPrice(products);
        for (Product* p : products) {
            cout << p->category << " | " << p->name 
                 << " | Pop: " << p->popularity 
                 << " | $" << p->price << endl;
        }
    }
    
    void displayPriceRangeSearch() {
        cout << "\n=== PRODUCTS IN PRICE RANGE $50-$150 ===" << endl;
        vector<Product*> products = catalog.getProductsByPriceRange(50, 150);
        for (Product* p : products) {
            cout << p->name << " | $" << p->price << endl;
        }
    }
    
    void displayWarehouses() {
        cout << "\n=== WAREHOUSE NETWORK ===" << endl;
        vector<Warehouse*> warehouses = warehouseNetwork.getAllWarehouses();
        for (Warehouse* w : warehouses) {
            cout << "Warehouse " << w->id << ": " << w->name << endl;
            cout << "  Connected to: ";
            for (Warehouse* conn : w->connections) {
                cout << conn->name << " ";
            }
            cout << endl;
        }
    }
    
    void demonstrateCart() {
        cout << "\n=== SHOPPING CART DEMONSTRATION ===" << endl;
        cart.addToCart(catalog.getProduct(1), 1);
        cart.addToCart(catalog.getProduct(2), 2);
        cart.addToCart(catalog.getProduct(6), 3);
        
        cout << "\nUndo last add:" << endl;
        cart.undoAdd();
        
        cout << "\nRedo:" << endl;
        cart.redoAdd();
        
        cout << "\nCart Total: $" << cart.getTotal() << endl;
        cart.clearCart();
    }
    
    void demonstrateCheckout() {
        cout << "\n=== CHECKOUT QUEUE DEMONSTRATION ===" << endl;
        checkoutQueue.enqueue(new Customer(1, "John Doe", true));
        checkoutQueue.enqueue(new Customer(2, "Jane Smith", false));
        checkoutQueue.enqueue(new Customer(3, "Bob Wilson", true));
        checkoutQueue.enqueue(new Customer(4, "Alice Brown", false));
        
        cout << "\nProcessing checkout (priority to loyalty members):" << endl;
        while (!checkoutQueue.isEmpty()) {
            Customer* customer = checkoutQueue.dequeue();
            cout << "Processing: " << customer->name 
                 << (customer->isLoyaltyMember ? " (Loyalty - Priority)" : "") << endl;
        }
    }
    
    void demonstrateForecasting() {
        cout << "\n=== DEMAND FORECASTING ===" << endl;
        time_t now = time(0);
        tm* ltm = localtime(&now);
        int currentMonth = ltm->tm_mon + 1;
        
        for (int pid : {1, 2}) {
            Product* p = catalog.getProduct(pid);
            double forecast = forecaster.forecastDemand(pid, currentMonth);
            bool lowStock = forecaster.isLowStockAlert(p, p->stock, currentMonth);
            
            cout << p->name << " | Forecast: " << forecast 
                 << " units | Low Stock Alert: " << (lowStock ? "YES" : "NO") << endl;
        }
    }
    
    void demonstrateRestocking() {
        cout << "\n=== RESTOCKING (GREEDY ALGORITHM) ===" << endl;
        vector<Product*> products = catalog.getAllProducts();
        
        map<int, double> turnoverRates;
        map<int, double> storageCosts;
        
        for (Product* p : products) {
            turnoverRates[p->id] = p->popularity / 100.0;
            storageCosts[p->id] = p->price / 1000.0;
        }
        
        vector<pair<int, int>> restockOrder = restockingSystem.calculateRestockOrder(
            products, turnoverRates, storageCosts, 500);
        
        cout << "Restock Order (Budget: $500):" << endl;
        for (auto& item : restockOrder) {
            Product* p = catalog.getProduct(item.first);
            cout << p->name << ": " << item.second << " units" << endl;
        }
    }
    
    void runDemo() {
        cout << "========================================" << endl;
        cout << "E-COMMERCE INVENTORY SYSTEM DEMO" << endl;
        cout << "========================================" << endl;
        
        initializeSampleData();
        displayProducts();
        displaySortedProducts();
        displayPriceRangeSearch();
        displayWarehouses();
        demonstrateCart();
        demonstrateCheckout();
        demonstrateForecasting();
        demonstrateRestocking();
        
        cout << "\n========================================" << endl;
        cout << "DEMO COMPLETE" << endl;
        cout << "========================================" << endl;
    }
};

int main() {
    ECommerceSystem system;
    system.runDemo();
    return 0;
}

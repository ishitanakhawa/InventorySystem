# E-Commerce Inventory System with Demand Forecasting

A mini-project demonstrating data structures and algorithms in C++ with a modern React UI following the Product UI Styleguide.

Features

Core Features
- **Product Catalog**: BST-based product lookup with O(log n) search complexity
- **Distributed Inventory**: Linked List per warehouse, Graph connecting warehouses
- **Restocking**: Greedy algorithm based on turnover rate × storage cost
- **Demand Forecasting**: Average × seasonality factor with low stock alerts
- **Cart Management**: Stack-based undo/redo functionality with stock validation
- **Checkout Queue**: Priority queue for loyalty members
- **Multi-level Sorting**: Category → Popularity → Price
- **Price Range Search**: Binary search on sorted products

Data Structures Used
- BST (Binary Search Tree)**: Product catalog for efficient lookups
- Linked List: Warehouse inventory management
- Graph: Warehouse network connections
- Stack: Cart undo/redo operations
- Priority Queue: Checkout queue with loyalty priority
- Greedy Algorithm: Restocking optimization

Project Structure

ecommerce-inventory-system/
├── backend/
│   ├── main.cpp          # C++ backend implementation
│   └── CMakeLists.txt    # CMake build configuration
└── frontend/
    ├── package.json       # Next.js dependencies
    ├── next.config.mjs    # API proxy to C++ backend (port 8080)
    ├── app/               # Next.js App Router pages
    │   ├── login/         # Authentication
    │   ├── products/      # Product catalog
    │   ├── inventory/     # Warehouse management
    │   ├── cart/          # Cart & checkout queue
    │   ├── customers/     # CRM & loyalty
    │   ├── pricing/       # Dynamic pricing engine
    │   └── supply-chain/  # Graph routing (BFS/DFS/Dijkstra)
    ├── components/        # Feature modules
    └── lib/               # API client, auth, polling hooks
```



 C++ Backend Demo
The C++ backend includes a comprehensive demo that showcases:
- Product catalog operations (BST)
- Warehouse network (Graph)
- Shopping cart (Stack with undo/redo)
- Checkout queue (Priority queue)
- Demand forecasting
- Restocking (Greedy algorithm)

Run the backend to see the demo output in the terminal.

 React Frontend
The React UI provides an interactive interface for:
- Dashboard: Overview of system stats, demand forecasts, and restock orders
- Products: Browse and search products with BST lookup visualization
- Inventory: View warehouse inventory (Linked List) and network (Graph)
- Cart: Shopping cart with undo/redo (Stack) and checkout queue (Priority Queue)

 Data Structures & Algorithms Explanation

 BST (Binary Search Tree)
- Used for product catalog
- Provides O(log n) average case search, insert, and delete operations
- Products are indexed by ID for efficient lookup
 Linked List
- Used for warehouse inventory
- Each warehouse maintains a linked list of products
- O(1) insertion at head, O(n) traversal

 Graph
- Used for warehouse network connections
- Undirected graph representing warehouse relationships
- Enables shortest path calculations for stock transfers

Stack
- Used for shopping cart undo/redo
- LIFO (Last In, First Out) structure
- O(1) push and pop operations

Priority Queue
- Used for checkout queue
- Loyalty members have higher priority
- O(log n) enqueue and dequeue operations

 Greedy Algorithm
- Used for restocking optimization
- Prioritizes products based on turnover rate × storage cost
- Makes locally optimal choices at each step

 Binary Search
- Used for price range queries
- Products sorted by price for efficient range searches
- O(log n) search complexity

 Team Roles (4 Members)

- **P1**: Product catalog (BST + Linked List warehouses) + Inventory records
- **P2**: Cart Stack (undo) + Checkout Queue + Stock validation
- **P3**: Restocking greedy logic + Demand forecasting + Multi-level sorting
- **P4**: BST lookups + Price range binary search + Supply chain graph

 Custom Features

The system includes several custom features beyond the requirements:
- Real-time demand forecasting with seasonality factors
- Visual representation of data structures in the UI
- Interactive undo/redo for cart operations
- Loyalty member priority in checkout queue
- Multi-level product sorting
- Low stock alerts based on demand forecasts

## Running the Application

**1. Start the C++ backend** (port 8080):
```bash
cd backend && mkdir -p build && cd build && cmake .. && make && ./inventory_system
```

**2. Start the Next.js frontend** (port 3000):
```bash
cd frontend && npm install && npm run dev
```

Open http://localhost:3000 — you will be redirected to `/login`.

**Demo accounts:** `admin` / `admin` (full access), `employee` / `employee` (partial), or **Continue as Guest** (read-only).

### App Router pages

| Route | Module |
|-------|--------|
| `/` | Dashboard — forecasts, restocking report, smart alerts |
| `/products` | Product catalog — search, CRUD, rating/turnover |
| `/inventory` | Warehouses — transfer, sync, alerts, real-time stock |
| `/cart` | Cart stack + checkout queue + billing simulation |
| `/customers` | Registration, purchase history, loyalty |
| `/pricing` | Dynamic pricing — demand, seasonal, discount, flash sale |
| `/supply-chain` | BFS/DFS/Dijkstra routing + transport costs |

 License

This is a mini-project for educational purposes.

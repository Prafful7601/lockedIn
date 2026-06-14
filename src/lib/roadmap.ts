// Striver's A2Z DSA Course — modelled lecture-by-lecture from the official
// YouTube playlist, grouped into Steps → Topics. Each item is a course lecture,
// so checking them off tracks your real progress through the videos.
//
// Reference: takeuforward.org "Strivers A2Z DSA Course/Sheet".

export type Difficulty = "easy" | "medium" | "hard";

export type SheetProblem = {
  title: string;
  difficulty: Difficulty;
  url?: string;
};

export type SheetTopic = { name: string; problems: SheetProblem[] };
export type SheetStep = { step: number; name: string; topics: SheetTopic[] };

// shorthand builders
const e = (title: string): SheetProblem => ({ title, difficulty: "easy" });
const m = (title: string): SheetProblem => ({ title, difficulty: "medium" });
const h = (title: string): SheetProblem => ({ title, difficulty: "hard" });

export const SHEET: SheetStep[] = [
  {
    step: 1,
    name: "Learn the Basics",
    topics: [
      {
        name: "Fundamentals",
        problems: [
          e("C++ Basics in One Shot (L1)"),
          e("Time and Space Complexity"),
          e("Solve any Pattern Question — 22 Patterns"),
          e("Complete C++ STL in 1 Video"),
        ],
      },
      {
        name: "Basic Maths",
        problems: [
          e("Basic Maths for DSA | Euclidean Algorithm"),
          e("Print all Divisors of a Number"),
          e("Check if a Number is Prime"),
          m("Print all Prime Factors of a Number"),
          m("Power Exponentiation"),
          m("Sieve of Eratosthenes"),
          m("Count Primes in a range L–R"),
          m("Smallest Prime Factor | Prime Factorisation"),
        ],
      },
      {
        name: "Basic Recursion",
        problems: [
          e("Introduction to Recursion | Recursion Tree | Stack Space"),
          e("Problems on Recursion"),
          e("Parameterised and Functional Recursion"),
          e("Problems on Functional Recursion"),
          m("Multiple Recursion Calls"),
        ],
      },
      {
        name: "Basic Hashing",
        problems: [m("Hashing | Maps | Collisions | Division Rule of Hashing")],
      },
    ],
  },
  {
    step: 2,
    name: "Sorting Techniques",
    topics: [
      {
        name: "Sorting",
        problems: [
          e("Selection Sort, Bubble Sort, Insertion Sort"),
          m("Merge Sort"),
          m("Quick Sort"),
        ],
      },
    ],
  },
  {
    step: 3,
    name: "Arrays",
    topics: [
      {
        name: "Arrays Easy",
        problems: [
          e("Second Largest Element | Remove Duplicates from Sorted Array"),
          e("Rotate Array by K | Union/Intersection | Move Zeros to End"),
          e("Element appearing once | Missing number | Max Consecutive 1's"),
          m("Longest Subarray with sum K"),
          e("2 Sum Problem"),
        ],
      },
      {
        name: "Arrays Medium",
        problems: [
          m("Sort an array of 0's, 1's & 2's"),
          e("Majority Element (Moore's Voting)"),
          m("Kadane's Algorithm | Maximum Subarray Sum"),
          e("Best Time to Buy and Sell Stock"),
          m("Rearrange Array Elements by Sign"),
          m("Next Permutation"),
          e("Leaders in an Array"),
          m("Longest Consecutive Sequence"),
          m("Set Matrix Zeroes"),
          m("Rotate Matrix / Image by 90 Degrees"),
          m("Spiral Traversal of a Matrix"),
          m("Count Subarray sum Equals K"),
          m("Pascal's Triangle"),
          m("Majority Element II (n/3)"),
        ],
      },
      {
        name: "Arrays Hard",
        problems: [
          m("3 Sum"),
          m("4 Sum"),
          h("Number of Subarrays with XOR K"),
          m("Merge Overlapping Intervals"),
          m("Merge Sorted Arrays Without Extra Space"),
          h("Find the Missing and Repeating Number"),
          h("Count Inversions in an Array"),
          h("Reverse Pairs"),
          m("Maximum Product Subarray"),
        ],
      },
    ],
  },
  {
    step: 4,
    name: "Binary Search",
    topics: [
      {
        name: "BS on 1D Arrays",
        problems: [
          e("BS-1 Binary Search Introduction"),
          e("BS-2 Lower/Upper Bound | Search Insert | Floor & Ceil"),
          e("BS-3 First and Last Occurrences | Count occurrences"),
          m("BS-4 Search in Rotated Sorted Array I"),
          m("BS-5 Search in Rotated Sorted Array II"),
          m("BS-6 Minimum in Rotated Sorted Array"),
          e("BS-7 How many times array is rotated"),
          m("BS-8 Single Element in Sorted Array"),
          m("BS-9 Find Peak Element"),
        ],
      },
      {
        name: "BS on Answers",
        problems: [
          e("BS-10 Find Sqrt of a number"),
          m("BS-11 Find the Nth root of an Integer"),
          m("BS-12 Koko Eating Bananas"),
          m("BS-13 Minimum days to make M bouquets"),
          m("BS-14 Smallest Divisor Given a Threshold"),
          m("BS-15 Capacity to Ship Packages within D Days"),
          m("BS-16 Kth Missing Positive Number"),
          h("BS-17 Aggressive Cows"),
          h("BS-18 Book Allocation"),
          h("BS-19 Painter's Partition / Split Array Largest Sum"),
          h("BS-20 Minimise Maximum Distance between Gas Stations"),
          h("BS-21 Median of two Sorted Arrays"),
          m("BS-22 K-th element of two sorted arrays"),
        ],
      },
      {
        name: "BS on 2D Arrays",
        problems: [
          m("BS-23 Row with maximum number of 1s"),
          m("BS-24 Search in a 2D Matrix I"),
          m("BS-25 Search in a 2D Matrix II"),
          h("BS-26 Find Peak Element II"),
          h("BS-27 Median in a Row Wise Sorted Matrix"),
        ],
      },
    ],
  },
  {
    step: 5,
    name: "Linked List",
    topics: [
      {
        name: "Singly & Doubly LL",
        problems: [
          e("L1 Introduction to LinkedList | Traversal | Length | Search"),
          e("L2 Deletion and Insertion in LL | 8 Problems"),
          e("L3 Introduction to Doubly LinkedList"),
          m("L4 Reverse a DLL"),
        ],
      },
      {
        name: "LL Medium",
        problems: [
          m("L5 Add 2 numbers in LinkedList"),
          m("L6 Odd Even Linked List"),
          m("L7 Sort LinkedList of 0's, 1's and 2's"),
          m("L8 Remove Nth Node from the end"),
          e("L9 Reverse a LinkedList (Iterative & Recursive)"),
          m("L10 Check if LinkedList is Palindrome"),
          m("L11 Add 1 to a number represented by LinkedList"),
          m("L12 Intersection point of Y LinkedList"),
          e("L13 Middle element of the LinkedList"),
          m("L14 Detect a loop/cycle in LinkedList"),
          m("L15 Length of the Loop in LinkedList"),
          m("L16 Delete the middle node"),
          m("L17 Starting point of the Loop/Cycle"),
          m("L18 Delete all occurrences of a Key in DLL"),
          m("L19 Find all Pairs with given Sum in DLL"),
          m("L20 Remove duplicates from sorted DLL"),
        ],
      },
      {
        name: "LL Hard",
        problems: [
          h("L21 Reverse Nodes in K Group"),
          m("L22 Rotate a LinkedList"),
          m("L23 Merge two sorted Linked Lists"),
          h("L24 Flattening a LinkedList"),
          h("L25 Merge K Sorted Lists"),
          m("L26 Sort a Linked List (Merge Sort)"),
          h("L27 Clone a LinkedList with Random Pointers"),
          m("L28 Design a Browser History"),
        ],
      },
    ],
  },
  {
    step: 6,
    name: "Stacks & Queues",
    topics: [
      {
        name: "Implementation",
        problems: [
          e("L1 Introduction to Stack and Queue | Implementation"),
          e("L2 Check for Balanced Parentheses"),
          m("L3 Prefix, Infix, and Postfix Conversion"),
          m("L4 Implement Min Stack"),
        ],
      },
      {
        name: "Monotonic Stack / Problems",
        problems: [
          m("L5 Next Greater Element"),
          m("L6 Next Greater Element II"),
          e("L7 Previous Smaller Element"),
          h("L8 Trapping Rainwater"),
          m("L9 Sum of Subarray Minimum"),
          m("L10 Sum of Subarray Ranges"),
          m("L11 Asteroid Collisions"),
          h("L12 Largest Rectangle in Histogram"),
          h("L13 Maximal Rectangle"),
          m("L14 Remove K Digits"),
          m("L15 Stock Span Problem"),
          h("L16 Sliding Window Maximum"),
          m("L17 The Celebrity Problem"),
          m("L18 Implement LRU Cache"),
          h("Implement LFU Cache"),
        ],
      },
    ],
  },
  {
    step: 7,
    name: "Sliding Window & Two Pointer",
    topics: [
      {
        name: "Sliding Window / Two Pointer",
        problems: [
          e("L1 Introduction to Sliding Window and 2 Pointers"),
          m("L2 Maximum Points You Can Obtain from Cards"),
          m("L3 Longest Substring Without Repeating Characters"),
          m("L4 Max Consecutive Ones III"),
          m("L5 Fruit Into Baskets"),
          m("L6 Longest Substring With At Most K Distinct"),
          m("L7 Number of Substrings Containing All Three Characters"),
          m("L8 Longest Repeating Character Replacement"),
          m("L9 Binary Subarrays With Sum"),
          m("L10 Count number of Nice Subarrays"),
          h("L11 Subarray with K Different Integers"),
          h("L12 Minimum Window Substring"),
        ],
      },
    ],
  },
  {
    step: 8,
    name: "Greedy Algorithms",
    topics: [
      {
        name: "Greedy",
        problems: [
          e("L1 Assign Cookies"),
          e("L2 Lemonade Change"),
          e("L3 Shortest Job First (SJF)"),
          m("L4 Jump Game I"),
          m("L5 Jump Game II"),
          m("L6 Job Sequencing Problem"),
          m("L7 N Meetings in One Room"),
          m("L8 Non Overlapping Intervals"),
          m("L9 Insert Intervals"),
          m("L10 Minimum number of platforms"),
          m("L11 Valid Parenthesis String"),
          h("L12 Candy"),
          m("L13 Fractional Knapsack"),
        ],
      },
    ],
  },
  {
    step: 9,
    name: "Binary Trees",
    topics: [
      {
        name: "Traversals",
        problems: [
          e("L1 Introduction to Trees | Types"),
          e("L2 Binary Tree Representation"),
          e("L4 Binary Tree Traversals | BFS | DFS"),
          e("L5 Preorder Traversal"),
          e("L6 Inorder Traversal"),
          e("L7 Postorder Traversal"),
          m("L8 Level Order Traversal"),
          m("L9 Iterative Preorder Traversal"),
          m("L10 Iterative Inorder Traversal"),
          m("L11 Iterative Postorder using 2 Stacks"),
          m("L12 Iterative Postorder using 1 Stack"),
          m("L13 Preorder, Inorder, Postorder in One Traversal"),
        ],
      },
      {
        name: "Tree Problems",
        problems: [
          e("L14 Maximum Depth | Height of Binary Tree"),
          m("L15 Check for Balanced Binary Tree"),
          e("L16 Diameter of Binary Tree"),
          h("L17 Maximum Path Sum"),
          e("L18 Check if two trees are Identical"),
          m("L19 Zig-Zag / Spiral Traversal"),
          m("L20 Boundary Traversal"),
          m("L21 Vertical Order Traversal"),
          m("L22 Top View of Binary Tree"),
          m("L23 Bottom View of Binary Tree"),
          m("L24 Right/Left View of Binary Tree"),
          m("L25 Check for Symmetrical Binary Trees"),
          m("L26 Print Root to Node Path"),
          m("L27 Lowest Common Ancestor (LCA)"),
          m("L28 Maximum Width of Binary Tree"),
          h("L29 Children Sum Property"),
          m("L30 Print all Nodes at distance K"),
          h("L31 Minimum time to BURN the Binary Tree"),
          m("L32 Count total Nodes in a COMPLETE Binary Tree"),
          e("L33 Requirements to construct a Unique Binary Tree"),
          h("L34 Construct Binary Tree from Preorder and Inorder"),
          h("L35 Construct Binary Tree from Postorder and Inorder"),
          h("L36 Serialize and De-serialize Binary Tree"),
          m("L37 Morris Traversal | Preorder | Inorder"),
          m("L38 Flatten Binary Tree to Linked List"),
        ],
      },
    ],
  },
  {
    step: 10,
    name: "Binary Search Trees",
    topics: [
      {
        name: "BST",
        problems: [
          e("L39 Introduction to BST"),
          e("L40 Search in a BST"),
          e("L41 Ceil in a BST"),
          e("L42 Floor in a BST"),
          m("L43 Insert a Node in BST"),
          m("L44 Delete a Node in BST"),
          m("L45 Kth Smallest/Largest Element in BST"),
          m("L46 Validate a BST"),
          e("L47 LCA in BST"),
          m("L48 Construct BST from Preorder"),
          m("L49 Inorder Successor/Predecessor in BST"),
          m("L50 BST Iterator"),
          m("L51 Two Sum in BST"),
          h("L52 Recover BST"),
          h("L53 Largest BST in Binary Tree"),
        ],
      },
    ],
  },
  {
    step: 11,
    name: "Graphs",
    topics: [
      {
        name: "Basics & Traversals",
        problems: [
          e("G1 Introduction to Graph | Types"),
          e("G2 Graph Representation"),
          e("G4 Connected Components"),
          m("G5 Breadth-First Search (BFS)"),
          m("G6 Depth-First Search (DFS)"),
          m("G7 Number of Provinces"),
          m("G8 Number of Islands"),
          m("G9 Flood Fill"),
          m("G10 Rotten Oranges"),
          m("G11 Detect Cycle in Undirected Graph (BFS)"),
          m("G12 Detect Cycle in Undirected Graph (DFS)"),
          m("G13 0/1 Matrix | Distance of nearest cell"),
          m("G14 Surrounded Regions"),
          m("G15 Number of Enclaves"),
          m("G16 Number of Distinct Islands"),
          m("G17 Bipartite Graph (BFS)"),
          m("G18 Bipartite Graph (DFS)"),
          m("G19 Detect cycle in Directed Graph (DFS)"),
          h("G20 Find Eventual Safe States (DFS)"),
        ],
      },
      {
        name: "Topo Sort & Shortest Path",
        problems: [
          m("G21 Topological Sort (DFS)"),
          m("G22 Kahn's Algorithm (BFS)"),
          m("G23 Detect Cycle in Directed Graph (BFS)"),
          m("G24 Course Schedule I and II"),
          h("G25 Find Eventual Safe States (BFS)"),
          h("G26 Alien Dictionary"),
          m("G27 Shortest Path in DAG (Topo Sort)"),
          m("G28 Shortest Path in Undirected Graph (Unit Weights)"),
          h("G29 Word Ladder I"),
          h("G30 Word Ladder II"),
          m("G32 Dijkstra's Algorithm (Priority Queue)"),
          m("G33 Dijkstra's Algorithm (Set)"),
          m("G35 Print Shortest Path — Dijkstra"),
          m("G36 Shortest Distance in a Binary Maze"),
          m("G37 Path With Minimum Effort"),
          m("G38 Cheapest Flights Within K Stops"),
          m("G39 Minimum Multiplications to Reach End"),
          h("G40 Number of Ways to Arrive at Destination"),
          h("G41 Bellman Ford Algorithm"),
          h("G42 Floyd Warshall Algorithm"),
          m("G43 City With Smallest Number of Neighbours"),
        ],
      },
      {
        name: "MST & Disjoint Set",
        problems: [
          e("G44 Minimum Spanning Tree — Theory"),
          m("G45 Prim's Algorithm"),
          h("G46 Disjoint Set | Union by Rank/Size | Path Compression"),
          m("G47 Kruskal's Algorithm"),
          m("G48 Number of Provinces (DSU)"),
          m("G49 Operations to Make Network Connected (DSU)"),
          h("G50 Accounts Merge (DSU)"),
          h("G51 Number of Islands II (DSU)"),
          h("G52 Making a Large Island (DSU)"),
          m("G53 Most Stones Removed (DSU)"),
          h("G54 Strongly Connected Components (Kosaraju)"),
          h("G55 Bridges in Graph (Tarjan)"),
          h("G56 Articulation Point in Graph"),
        ],
      },
    ],
  },
  {
    step: 12,
    name: "Dynamic Programming",
    topics: [
      {
        name: "Intro & 1D/2D DP",
        problems: [
          e("DP1 Introduction to DP | Memoization | Tabulation"),
          e("DP2 Climbing Stairs"),
          m("DP3 Frog Jump"),
          m("DP4 Frog Jump with K Distances"),
          m("DP5 Maximum Sum of Non-Adjacent Elements (House Robber)"),
          m("DP6 House Robber II"),
          m("DP7 Ninja's Training"),
          m("DP8 Grid Unique Paths"),
          m("DP9 Unique Paths II"),
          m("DP10 Minimum Path Sum in Grid"),
          m("DP11 Triangle"),
          m("DP12 Minimum/Maximum Falling Path Sum"),
          h("DP13 Cherry Pickup II"),
        ],
      },
      {
        name: "DP on Subsequences",
        problems: [
          m("DP14 Subset Sum Equals Target"),
          m("DP15 Partition Equal Subset Sum"),
          h("DP16 Partition Set into Two Subsets Min Diff"),
          m("DP17 Count Subsets with Sum K"),
          h("DP18 Count Partitions With Given Difference"),
          m("DP19 0/1 Knapsack"),
          m("DP20 Minimum Coins"),
          m("DP21 Target Sum"),
          m("DP22 Coin Change II"),
          m("DP23 Unbounded Knapsack"),
          m("DP24 Rod Cutting Problem"),
        ],
      },
      {
        name: "DP on Strings",
        problems: [
          m("DP25 Longest Common Subsequence"),
          m("DP26 Print Longest Common Subsequence"),
          m("DP27 Longest Common Substring"),
          m("DP28 Longest Palindromic Subsequence"),
          m("DP29 Minimum Insertions to Make String Palindrome"),
          m("DP30 Min Insertions/Deletions to Convert A to B"),
          h("DP31 Shortest Common Supersequence"),
          h("DP32 Distinct Subsequences"),
          h("DP33 Edit Distance"),
          h("DP34 Wildcard Matching"),
        ],
      },
      {
        name: "DP on Stocks",
        problems: [
          e("DP35 Best Time to Buy and Sell Stock"),
          m("DP36 Buy and Sell Stock II"),
          h("DP37 Buy and Sell Stocks III"),
          h("DP38 Buy and Sell Stock IV"),
          m("DP39 Buy and Sell Stocks With Cooldown"),
          m("DP40 Buy and Sell Stocks With Transaction Fee"),
        ],
      },
      {
        name: "DP on LIS",
        problems: [
          m("DP41 Longest Increasing Subsequence (Memo)"),
          m("DP42 Printing LIS"),
          m("DP43 LIS using Binary Search"),
          m("DP44 Largest Divisible Subset"),
          m("DP45 Longest String Chain"),
          m("DP46 Longest Bitonic Subsequence"),
          m("DP47 Number of Longest Increasing Subsequences"),
        ],
      },
      {
        name: "MCM / Partition & Rectangles",
        problems: [
          h("DP48 Matrix Chain Multiplication"),
          h("DP49 MCM Bottom-Up Tabulation"),
          h("DP50 Minimum Cost to Cut the Stick"),
          h("DP51 Burst Balloons"),
          h("DP52 Evaluate Boolean Expression to True"),
          h("DP53 Palindrome Partitioning II"),
          m("DP54 Partition Array for Maximum Sum"),
          h("DP55 Maximum Rectangle Area with all 1's"),
          m("DP56 Count Square Submatrices with All Ones"),
        ],
      },
    ],
  },
];

// ---- derived / flattened views -------------------------------------------

export type FlatProblem = SheetProblem & {
  key: string;
  step: number;
  stepName: string;
  topic: string;
  order: number;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export const SHEET_PROBLEMS: FlatProblem[] = (() => {
  const out: FlatProblem[] = [];
  let order = 0;
  for (const step of SHEET) {
    for (const topic of step.topics) {
      for (const p of topic.problems) {
        out.push({
          ...p,
          key: `s${step.step}-${String(order).padStart(3, "0")}-${slugify(p.title)}`,
          step: step.step,
          stepName: step.name,
          topic: topic.name,
          order,
        });
        order++;
      }
    }
  }
  return out;
})();

export const TOTAL_PROBLEMS = SHEET_PROBLEMS.length;
export const TOTAL_STEPS = SHEET.length;

// Striver's A2Z DSA Sheet, modelled as 18 ordered Steps → Topics → Problems.
//
// This is a curated, beginner-forward subset of the full ~455-problem sheet:
// every Step and the key topics are present, with a solid starter set of
// problems each (fuller on the early steps you'll hit first). To add more,
// just append to the relevant topic's `problems` array — the DB reseeds by a
// stable key, so your checked-off progress is preserved.
//
// Reference: https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/

export type Difficulty = "easy" | "medium" | "hard";

export type SheetProblem = {
  title: string;
  difficulty: Difficulty;
  url?: string;
};

export type SheetTopic = {
  name: string;
  problems: SheetProblem[];
};

export type SheetStep = {
  step: number;
  name: string;
  topics: SheetTopic[];
};

const lc = (slug: string) => `https://leetcode.com/problems/${slug}/`;

export const SHEET: SheetStep[] = [
  {
    step: 1,
    name: "Learn the basics",
    topics: [
      {
        name: "Basic Maths",
        problems: [
          { title: "Count digits", difficulty: "easy" },
          { title: "Reverse a number", difficulty: "easy" },
          { title: "Check palindrome number", difficulty: "easy", url: lc("palindrome-number") },
          { title: "GCD / HCF", difficulty: "easy" },
          { title: "Armstrong number", difficulty: "easy" },
          { title: "Print all divisors", difficulty: "easy" },
          { title: "Check for prime", difficulty: "easy" },
        ],
      },
      {
        name: "Basic Recursion",
        problems: [
          { title: "Sum of first N numbers (recursion)", difficulty: "easy" },
          { title: "Factorial of N (recursion)", difficulty: "easy" },
          { title: "Reverse an array (recursion)", difficulty: "easy" },
          { title: "Check palindrome string (recursion)", difficulty: "easy" },
          { title: "Fibonacci number", difficulty: "easy", url: lc("fibonacci-number") },
        ],
      },
      {
        name: "Basic Hashing",
        problems: [
          { title: "Counting frequencies of elements", difficulty: "easy" },
          { title: "Highest/lowest frequency element", difficulty: "easy" },
        ],
      },
    ],
  },
  {
    step: 2,
    name: "Important Sorting Techniques",
    topics: [
      {
        name: "Sorting-I",
        problems: [
          { title: "Selection sort", difficulty: "easy" },
          { title: "Bubble sort", difficulty: "easy" },
          { title: "Insertion sort", difficulty: "easy" },
        ],
      },
      {
        name: "Sorting-II",
        problems: [
          { title: "Merge sort", difficulty: "medium", url: lc("sort-an-array") },
          { title: "Quick sort", difficulty: "medium" },
          { title: "Recursive bubble sort", difficulty: "easy" },
          { title: "Recursive insertion sort", difficulty: "easy" },
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
          { title: "Largest element in array", difficulty: "easy" },
          { title: "Second largest element", difficulty: "easy" },
          { title: "Check if array is sorted", difficulty: "easy", url: lc("check-if-array-is-sorted-and-rotated") },
          { title: "Remove duplicates from sorted array", difficulty: "easy", url: lc("remove-duplicates-from-sorted-array") },
          { title: "Left rotate array by D places", difficulty: "easy", url: lc("rotate-array") },
          { title: "Move zeroes to end", difficulty: "easy", url: lc("move-zeroes") },
          { title: "Linear search", difficulty: "easy" },
          { title: "Union of two sorted arrays", difficulty: "easy" },
          { title: "Find missing number", difficulty: "easy", url: lc("missing-number") },
          { title: "Max consecutive ones", difficulty: "easy", url: lc("max-consecutive-ones") },
          { title: "Single number", difficulty: "easy", url: lc("single-number") },
          { title: "Longest subarray with sum K", difficulty: "medium" },
        ],
      },
      {
        name: "Arrays Medium",
        problems: [
          { title: "Two Sum", difficulty: "easy", url: lc("two-sum") },
          { title: "Sort an array of 0s, 1s and 2s", difficulty: "medium", url: lc("sort-colors") },
          { title: "Majority element (>n/2)", difficulty: "easy", url: lc("majority-element") },
          { title: "Kadane's algorithm (max subarray sum)", difficulty: "medium", url: lc("maximum-subarray") },
          { title: "Best time to buy and sell stock", difficulty: "easy", url: lc("best-time-to-buy-and-sell-stock") },
          { title: "Rearrange array by sign", difficulty: "medium", url: lc("rearrange-array-elements-by-sign") },
          { title: "Next permutation", difficulty: "medium", url: lc("next-permutation") },
          { title: "Leaders in an array", difficulty: "easy" },
          { title: "Longest consecutive sequence", difficulty: "medium", url: lc("longest-consecutive-sequence") },
          { title: "Set matrix zeroes", difficulty: "medium", url: lc("set-matrix-zeroes") },
          { title: "Rotate matrix by 90 degrees", difficulty: "medium", url: lc("rotate-image") },
          { title: "Spiral matrix", difficulty: "medium", url: lc("spiral-matrix") },
          { title: "Pascal's triangle", difficulty: "medium", url: lc("pascals-triangle") },
        ],
      },
      {
        name: "Arrays Hard",
        problems: [
          { title: "3 Sum", difficulty: "medium", url: lc("3sum") },
          { title: "4 Sum", difficulty: "medium", url: lc("4sum") },
          { title: "Count subarrays with XOR K", difficulty: "hard" },
          { title: "Merge intervals", difficulty: "medium", url: lc("merge-intervals") },
          { title: "Merge two sorted arrays without extra space", difficulty: "medium", url: lc("merge-sorted-array") },
          { title: "Find repeating and missing number", difficulty: "hard" },
          { title: "Count inversions", difficulty: "hard" },
          { title: "Reverse pairs", difficulty: "hard", url: lc("reverse-pairs") },
          { title: "Maximum product subarray", difficulty: "medium", url: lc("maximum-product-subarray") },
        ],
      },
    ],
  },
  {
    step: 4,
    name: "Binary Search",
    topics: [
      {
        name: "BS on 1D arrays",
        problems: [
          { title: "Binary search to find X", difficulty: "easy", url: lc("binary-search") },
          { title: "Lower bound", difficulty: "easy" },
          { title: "Upper bound", difficulty: "easy" },
          { title: "Search insert position", difficulty: "easy", url: lc("search-insert-position") },
          { title: "First and last occurrence", difficulty: "medium", url: lc("find-first-and-last-position-of-element-in-sorted-array") },
          { title: "Search in rotated sorted array", difficulty: "medium", url: lc("search-in-rotated-sorted-array") },
          { title: "Find minimum in rotated sorted array", difficulty: "medium", url: lc("find-minimum-in-rotated-sorted-array") },
          { title: "Single element in sorted array", difficulty: "medium", url: lc("single-element-in-a-sorted-array") },
          { title: "Find peak element", difficulty: "medium", url: lc("find-peak-element") },
        ],
      },
      {
        name: "BS on answers",
        problems: [
          { title: "Square root using binary search", difficulty: "easy", url: lc("sqrtx") },
          { title: "Koko eating bananas", difficulty: "medium", url: lc("koko-eating-bananas") },
          { title: "Minimum days to make M bouquets", difficulty: "medium", url: lc("minimum-number-of-days-to-make-m-bouquets") },
          { title: "Capacity to ship packages within D days", difficulty: "medium", url: lc("capacity-to-ship-packages-within-d-days") },
          { title: "Aggressive cows", difficulty: "hard" },
          { title: "Book allocation / split array largest sum", difficulty: "hard", url: lc("split-array-largest-sum") },
          { title: "Median of two sorted arrays", difficulty: "hard", url: lc("median-of-two-sorted-arrays") },
        ],
      },
    ],
  },
  {
    step: 5,
    name: "Strings",
    topics: [
      {
        name: "Strings Basic",
        problems: [
          { title: "Remove outermost parentheses", difficulty: "easy", url: lc("remove-outermost-parentheses") },
          { title: "Reverse words in a string", difficulty: "medium", url: lc("reverse-words-in-a-string") },
          { title: "Largest odd number in a string", difficulty: "easy", url: lc("largest-odd-number-in-string") },
          { title: "Longest common prefix", difficulty: "easy", url: lc("longest-common-prefix") },
          { title: "Isomorphic strings", difficulty: "easy", url: lc("isomorphic-strings") },
          { title: "Valid anagram", difficulty: "easy", url: lc("valid-anagram") },
        ],
      },
      {
        name: "Strings Medium",
        problems: [
          { title: "Sort characters by frequency", difficulty: "medium", url: lc("sort-characters-by-frequency") },
          { title: "Roman to integer", difficulty: "easy", url: lc("roman-to-integer") },
          { title: "String to integer (atoi)", difficulty: "medium", url: lc("string-to-integer-atoi") },
          { title: "Longest palindromic substring", difficulty: "medium", url: lc("longest-palindromic-substring") },
        ],
      },
    ],
  },
  {
    step: 6,
    name: "Linked List",
    topics: [
      {
        name: "Singly & Doubly LL",
        problems: [
          { title: "Introduction & insert in singly LL", difficulty: "easy" },
          { title: "Delete and length of singly LL", difficulty: "easy" },
          { title: "Doubly linked list operations", difficulty: "easy" },
          { title: "Reverse a doubly linked list", difficulty: "medium" },
        ],
      },
      {
        name: "LL Medium",
        problems: [
          { title: "Middle of the linked list", difficulty: "easy", url: lc("middle-of-the-linked-list") },
          { title: "Reverse a linked list", difficulty: "easy", url: lc("reverse-linked-list") },
          { title: "Detect a loop in linked list", difficulty: "medium", url: lc("linked-list-cycle") },
          { title: "Starting point of loop", difficulty: "medium", url: lc("linked-list-cycle-ii") },
          { title: "Check if linked list is palindrome", difficulty: "easy", url: lc("palindrome-linked-list") },
          { title: "Remove Nth node from end", difficulty: "medium", url: lc("remove-nth-node-from-end-of-list") },
          { title: "Sort a linked list", difficulty: "medium", url: lc("sort-list") },
          { title: "Add two numbers as linked lists", difficulty: "medium", url: lc("add-two-numbers") },
          { title: "Intersection of two linked lists", difficulty: "easy", url: lc("intersection-of-two-linked-lists") },
        ],
      },
      {
        name: "LL Hard",
        problems: [
          { title: "Reverse nodes in k-group", difficulty: "hard", url: lc("reverse-nodes-in-k-group") },
          { title: "Rotate a linked list", difficulty: "medium", url: lc("rotate-list") },
          { title: "Flatten a linked list", difficulty: "hard" },
          { title: "Copy list with random pointer", difficulty: "medium", url: lc("copy-list-with-random-pointer") },
        ],
      },
    ],
  },
  {
    step: 7,
    name: "Recursion",
    topics: [
      {
        name: "Subsequences & power set",
        problems: [
          { title: "Generate all subsequences", difficulty: "medium" },
          { title: "Subsets (power set)", difficulty: "medium", url: lc("subsets") },
          { title: "Subsets II", difficulty: "medium", url: lc("subsets-ii") },
          { title: "Combination sum", difficulty: "medium", url: lc("combination-sum") },
          { title: "Combination sum II", difficulty: "medium", url: lc("combination-sum-ii") },
        ],
      },
      {
        name: "Hard backtracking",
        problems: [
          { title: "Palindrome partitioning", difficulty: "medium", url: lc("palindrome-partitioning") },
          { title: "Word search", difficulty: "medium", url: lc("word-search") },
          { title: "N-Queens", difficulty: "hard", url: lc("n-queens") },
          { title: "Sudoku solver", difficulty: "hard", url: lc("sudoku-solver") },
          { title: "Rat in a maze", difficulty: "hard" },
        ],
      },
    ],
  },
  {
    step: 8,
    name: "Bit Manipulation",
    topics: [
      {
        name: "Bit basics",
        problems: [
          { title: "Check / set / clear the i-th bit", difficulty: "easy" },
          { title: "Count set bits", difficulty: "easy", url: lc("number-of-1-bits") },
          { title: "Check if number is power of two", difficulty: "easy", url: lc("power-of-two") },
          { title: "Single number II", difficulty: "medium", url: lc("single-number-ii") },
          { title: "Single number III", difficulty: "medium", url: lc("single-number-iii") },
          { title: "Divide two integers without /", difficulty: "medium", url: lc("divide-two-integers") },
        ],
      },
    ],
  },
  {
    step: 9,
    name: "Stack and Queues",
    topics: [
      {
        name: "Implementations",
        problems: [
          { title: "Implement stack using arrays", difficulty: "easy" },
          { title: "Implement queue using arrays", difficulty: "easy" },
          { title: "Implement stack using queue", difficulty: "easy", url: lc("implement-stack-using-queues") },
          { title: "Implement queue using stack", difficulty: "easy", url: lc("implement-queue-using-stacks") },
        ],
      },
      {
        name: "Monotonic stack / problems",
        problems: [
          { title: "Valid parentheses", difficulty: "easy", url: lc("valid-parentheses") },
          { title: "Min stack", difficulty: "medium", url: lc("min-stack") },
          { title: "Next greater element", difficulty: "easy", url: lc("next-greater-element-i") },
          { title: "Next greater element II", difficulty: "medium", url: lc("next-greater-element-ii") },
          { title: "Trapping rainwater", difficulty: "hard", url: lc("trapping-rain-water") },
          { title: "Sum of subarray minimums", difficulty: "medium", url: lc("sum-of-subarray-minimums") },
          { title: "Asteroid collision", difficulty: "medium", url: lc("asteroid-collision") },
          { title: "Largest rectangle in histogram", difficulty: "hard", url: lc("largest-rectangle-in-histogram") },
          { title: "LRU cache", difficulty: "medium", url: lc("lru-cache") },
        ],
      },
    ],
  },
  {
    step: 10,
    name: "Sliding Window & Two Pointer",
    topics: [
      {
        name: "Sliding window / two pointer",
        problems: [
          { title: "Longest substring without repeating characters", difficulty: "medium", url: lc("longest-substring-without-repeating-characters") },
          { title: "Max consecutive ones III", difficulty: "medium", url: lc("max-consecutive-ones-iii") },
          { title: "Fruit into baskets", difficulty: "medium", url: lc("fruit-into-baskets") },
          { title: "Longest repeating character replacement", difficulty: "medium", url: lc("longest-repeating-character-replacement") },
          { title: "Binary subarrays with sum", difficulty: "medium", url: lc("binary-subarrays-with-sum") },
          { title: "Count number of nice subarrays", difficulty: "medium", url: lc("count-number-of-nice-subarrays") },
          { title: "Subarrays with K different integers", difficulty: "hard", url: lc("subarrays-with-k-different-integers") },
          { title: "Minimum window substring", difficulty: "hard", url: lc("minimum-window-substring") },
        ],
      },
    ],
  },
  {
    step: 11,
    name: "Heaps",
    topics: [
      {
        name: "Heaps & priority queue",
        problems: [
          { title: "Min heap / max heap & heapify", difficulty: "medium" },
          { title: "Kth largest element in an array", difficulty: "medium", url: lc("kth-largest-element-in-an-array") },
          { title: "Merge K sorted lists", difficulty: "hard", url: lc("merge-k-sorted-lists") },
          { title: "Task scheduler", difficulty: "medium", url: lc("task-scheduler") },
          { title: "Hands of straights", difficulty: "medium", url: lc("hand-of-straights") },
          { title: "Find median from data stream", difficulty: "hard", url: lc("find-median-from-data-stream") },
          { title: "Top K frequent elements", difficulty: "medium", url: lc("top-k-frequent-elements") },
        ],
      },
    ],
  },
  {
    step: 12,
    name: "Greedy Algorithms",
    topics: [
      {
        name: "Greedy",
        problems: [
          { title: "Assign cookies", difficulty: "easy", url: lc("assign-cookies") },
          { title: "Fractional knapsack", difficulty: "medium" },
          { title: "Lemonade change", difficulty: "easy", url: lc("lemonade-change") },
          { title: "Valid parenthesis string", difficulty: "medium", url: lc("valid-parenthesis-string") },
          { title: "N meetings in one room", difficulty: "medium" },
          { title: "Jump game", difficulty: "medium", url: lc("jump-game") },
          { title: "Jump game II", difficulty: "medium", url: lc("jump-game-ii") },
          { title: "Job sequencing problem", difficulty: "medium" },
          { title: "Candy", difficulty: "hard", url: lc("candy") },
          { title: "Insert interval", difficulty: "medium", url: lc("insert-interval") },
          { title: "Non-overlapping intervals", difficulty: "medium", url: lc("non-overlapping-intervals") },
        ],
      },
    ],
  },
  {
    step: 13,
    name: "Binary Trees",
    topics: [
      {
        name: "Traversals",
        problems: [
          { title: "Preorder traversal", difficulty: "easy", url: lc("binary-tree-preorder-traversal") },
          { title: "Inorder traversal", difficulty: "easy", url: lc("binary-tree-inorder-traversal") },
          { title: "Postorder traversal", difficulty: "easy", url: lc("binary-tree-postorder-traversal") },
          { title: "Level order traversal", difficulty: "medium", url: lc("binary-tree-level-order-traversal") },
        ],
      },
      {
        name: "Tree problems",
        problems: [
          { title: "Maximum depth of binary tree", difficulty: "easy", url: lc("maximum-depth-of-binary-tree") },
          { title: "Balanced binary tree", difficulty: "easy", url: lc("balanced-binary-tree") },
          { title: "Diameter of binary tree", difficulty: "easy", url: lc("diameter-of-binary-tree") },
          { title: "Maximum path sum", difficulty: "hard", url: lc("binary-tree-maximum-path-sum") },
          { title: "Zigzag level order traversal", difficulty: "medium", url: lc("binary-tree-zigzag-level-order-traversal") },
          { title: "Top view / bottom view", difficulty: "medium" },
          { title: "Lowest common ancestor", difficulty: "medium", url: lc("lowest-common-ancestor-of-a-binary-tree") },
          { title: "Construct tree from inorder & preorder", difficulty: "medium", url: lc("construct-binary-tree-from-preorder-and-inorder-traversal") },
          { title: "Serialize and deserialize binary tree", difficulty: "hard", url: lc("serialize-and-deserialize-binary-tree") },
        ],
      },
    ],
  },
  {
    step: 14,
    name: "Binary Search Trees",
    topics: [
      {
        name: "BST",
        problems: [
          { title: "Search in a BST", difficulty: "easy", url: lc("search-in-a-binary-search-tree") },
          { title: "Ceil / floor in a BST", difficulty: "easy" },
          { title: "Insert into a BST", difficulty: "medium", url: lc("insert-into-a-binary-search-tree") },
          { title: "Delete node in a BST", difficulty: "medium", url: lc("delete-node-in-a-bst") },
          { title: "Kth smallest element in a BST", difficulty: "medium", url: lc("kth-smallest-element-in-a-bst") },
          { title: "Validate binary search tree", difficulty: "medium", url: lc("validate-binary-search-tree") },
          { title: "LCA in a BST", difficulty: "easy", url: lc("lowest-common-ancestor-of-a-binary-search-tree") },
          { title: "BST iterator", difficulty: "medium", url: lc("binary-search-tree-iterator") },
        ],
      },
    ],
  },
  {
    step: 15,
    name: "Graphs",
    topics: [
      {
        name: "Traversals & basics",
        problems: [
          { title: "BFS of graph", difficulty: "easy" },
          { title: "DFS of graph", difficulty: "easy" },
          { title: "Number of provinces", difficulty: "medium", url: lc("number-of-provinces") },
          { title: "Number of islands", difficulty: "medium", url: lc("number-of-islands") },
          { title: "Flood fill", difficulty: "easy", url: lc("flood-fill") },
          { title: "Rotting oranges", difficulty: "medium", url: lc("rotting-oranges") },
          { title: "Detect cycle (undirected/directed)", difficulty: "medium", url: lc("course-schedule") },
          { title: "Is graph bipartite", difficulty: "medium", url: lc("is-graph-bipartite") },
        ],
      },
      {
        name: "Topo sort & shortest path",
        problems: [
          { title: "Topological sort", difficulty: "medium", url: lc("course-schedule-ii") },
          { title: "Word ladder", difficulty: "hard", url: lc("word-ladder") },
          { title: "Dijkstra's algorithm", difficulty: "medium", url: lc("network-delay-time") },
          { title: "Cheapest flights within K stops", difficulty: "medium", url: lc("cheapest-flights-within-k-stops") },
          { title: "Number of operations to make network connected", difficulty: "medium", url: lc("number-of-operations-to-make-network-connected") },
          { title: "Accounts merge (DSU)", difficulty: "medium", url: lc("accounts-merge") },
        ],
      },
    ],
  },
  {
    step: 16,
    name: "Dynamic Programming",
    topics: [
      {
        name: "1D & 2D DP",
        problems: [
          { title: "Climbing stairs", difficulty: "easy", url: lc("climbing-stairs") },
          { title: "House robber", difficulty: "medium", url: lc("house-robber") },
          { title: "House robber II", difficulty: "medium", url: lc("house-robber-ii") },
          { title: "Unique paths", difficulty: "medium", url: lc("unique-paths") },
          { title: "Minimum path sum", difficulty: "medium", url: lc("minimum-path-sum") },
          { title: "Triangle", difficulty: "medium", url: lc("triangle") },
        ],
      },
      {
        name: "Subsequences & strings DP",
        problems: [
          { title: "Partition equal subset sum", difficulty: "medium", url: lc("partition-equal-subset-sum") },
          { title: "0/1 knapsack", difficulty: "medium" },
          { title: "Coin change", difficulty: "medium", url: lc("coin-change") },
          { title: "Coin change II", difficulty: "medium", url: lc("coin-change-ii") },
          { title: "Longest common subsequence", difficulty: "medium", url: lc("longest-common-subsequence") },
          { title: "Edit distance", difficulty: "medium", url: lc("edit-distance") },
          { title: "Longest increasing subsequence", difficulty: "medium", url: lc("longest-increasing-subsequence") },
          { title: "Best time to buy and sell stock III", difficulty: "hard", url: lc("best-time-to-buy-and-sell-stock-iii") },
        ],
      },
    ],
  },
  {
    step: 17,
    name: "Tries",
    topics: [
      {
        name: "Tries",
        problems: [
          { title: "Implement Trie (prefix tree)", difficulty: "medium", url: lc("implement-trie-prefix-tree") },
          { title: "Implement Trie II (with counts)", difficulty: "medium" },
          { title: "Longest word with all prefixes", difficulty: "medium", url: lc("longest-word-in-dictionary") },
          { title: "Number of distinct substrings", difficulty: "hard" },
          { title: "Maximum XOR of two numbers in an array", difficulty: "medium", url: lc("maximum-xor-of-two-numbers-in-an-array") },
        ],
      },
    ],
  },
  {
    step: 18,
    name: "Strings (Advanced)",
    topics: [
      {
        name: "Advanced string algorithms",
        problems: [
          { title: "Minimum characters to add for palindrome (KMP)", difficulty: "hard", url: lc("shortest-palindrome") },
          { title: "Longest happy prefix (LPS array)", difficulty: "hard", url: lc("longest-happy-prefix") },
          { title: "Count and say", difficulty: "medium", url: lc("count-and-say") },
          { title: "Repeated string match (Rabin-Karp)", difficulty: "medium", url: lc("repeated-string-match") },
        ],
      },
    ],
  },
];

// ---- derived / flattened views -------------------------------------------

export type FlatProblem = SheetProblem & {
  key: string; // stable unique id used as the DB primary key
  step: number;
  stepName: string;
  topic: string;
  order: number; // global position across the whole sheet
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

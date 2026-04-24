/**
 * Hierarchy Processor
 * 
 * Core logic for processing hierarchical edge data.
 * Handles validation, duplicate detection, tree construction,
 * cycle detection, depth calculation, and summary generation.
 */

// ─── User Configuration ──────────────────────────────────────
// TODO: Replace these with your actual details
const USER_CONFIG = {
  user_id: 'bhanu_24042005',          // fullname_ddmmyyyy
  email_id: 'bp1234@srmist.edu.in',   // your college email
  college_roll_number: 'RA2211003010000' // your college roll number
};

/**
 * Main processing function
 * Takes an array of edge strings and returns the structured response
 * 
 * @param {string[]} data - Array of edge strings like ["A->B", "A->C"]
 * @returns {Object} Structured hierarchy response
 */
function processHierarchy(data) {
  // Step 1: Validate each entry
  const { validEdges, invalidEntries } = validateEntries(data);

  // Step 2: Detect duplicate edges
  const { uniqueEdges, duplicateEdges } = detectDuplicates(validEdges);

  // Step 3: Build adjacency structures & handle multi-parent (diamond) cases
  const { adjacency, allNodes, effectiveEdges } = buildAdjacency(uniqueEdges);

  // Step 4: Identify connected components
  const components = findComponents(allNodes, effectiveEdges);

  // Step 5: For each component, detect cycles & build tree
  const hierarchies = [];
  let totalTrees = 0;
  let totalCycles = 0;
  let largestTreeRoot = null;
  let largestTreeDepth = 0;

  for (const component of components) {
    const result = processComponent(component, effectiveEdges);
    hierarchies.push(result);

    if (result.has_cycle) {
      totalCycles++;
    } else {
      totalTrees++;
      if (
        result.depth > largestTreeDepth ||
        (result.depth === largestTreeDepth &&
          (largestTreeRoot === null || result.root < largestTreeRoot))
      ) {
        largestTreeDepth = result.depth;
        largestTreeRoot = result.root;
      }
    }
  }

  // Step 6: Build summary
  const summary = {
    total_trees: totalTrees,
    total_cycles: totalCycles,
    largest_tree_root: largestTreeRoot || ''
  };

  return {
    ...USER_CONFIG,
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary
  };
}

// ═══════════════════════════════════════════════════════════════
// STEP 1: Validation
// ═══════════════════════════════════════════════════════════════

/**
 * Validates each entry in the data array.
 * Valid format: single uppercase letter -> single uppercase letter (not self-loop)
 * 
 * @param {string[]} data - Raw input array
 * @returns {{ validEdges: string[], invalidEntries: string[] }}
 */
function validateEntries(data) {
  const validEdges = [];
  const invalidEntries = [];

  // Regex: exactly one uppercase letter, then "->", then exactly one uppercase letter
  const edgePattern = /^([A-Z])->([A-Z])$/;

  for (const entry of data) {
    // Trim whitespace before validation
    const trimmed = (typeof entry === 'string') ? entry.trim() : String(entry).trim();

    const match = trimmed.match(edgePattern);

    if (!match) {
      // Invalid format
      invalidEntries.push(trimmed);
      continue;
    }

    const [, parent, child] = match;

    // Self-loop check (A->A is invalid)
    if (parent === child) {
      invalidEntries.push(trimmed);
      continue;
    }

    validEdges.push(trimmed);
  }

  return { validEdges, invalidEntries };
}

// ═══════════════════════════════════════════════════════════════
// STEP 2: Duplicate Detection
// ═══════════════════════════════════════════════════════════════

/**
 * Detects and separates duplicate edges.
 * First occurrence is kept; later duplicates added to duplicate list (once).
 * 
 * @param {string[]} validEdges - Array of valid edge strings
 * @returns {{ uniqueEdges: string[], duplicateEdges: string[] }}
 */
function detectDuplicates(validEdges) {
  const seen = new Set();
  const duplicateSet = new Set();
  const uniqueEdges = [];
  const duplicateEdges = [];

  for (const edge of validEdges) {
    if (seen.has(edge)) {
      // It's a duplicate — add to duplicate list only once
      if (!duplicateSet.has(edge)) {
        duplicateEdges.push(edge);
        duplicateSet.add(edge);
      }
    } else {
      seen.add(edge);
      uniqueEdges.push(edge);
    }
  }

  return { uniqueEdges, duplicateEdges };
}

// ═══════════════════════════════════════════════════════════════
// STEP 3: Build Adjacency (with Diamond/Multi-Parent Handling)
// ═══════════════════════════════════════════════════════════════

/**
 * Builds adjacency list from unique edges.
 * If a child already has a parent (diamond case),
 * the later parent edge is silently discarded.
 * 
 * @param {string[]} uniqueEdges - Deduplicated valid edges
 * @returns {{ adjacency: Map, allNodes: Set, effectiveEdges: string[] }}
 */
function buildAdjacency(uniqueEdges) {
  const childParentMap = new Map();  // child -> first parent
  const adjacency = new Map();       // parent -> [children]
  const allNodes = new Set();
  const effectiveEdges = [];

  for (const edge of uniqueEdges) {
    const [parent, child] = edge.split('->');
    allNodes.add(parent);
    allNodes.add(child);

    // Diamond case: child already has a parent — discard silently
    if (childParentMap.has(child)) {
      continue;
    }

    childParentMap.set(child, parent);

    if (!adjacency.has(parent)) {
      adjacency.set(parent, []);
    }
    adjacency.get(parent).push(child);
    effectiveEdges.push(edge);
  }

  return { adjacency, allNodes, effectiveEdges };
}

// ═══════════════════════════════════════════════════════════════
// STEP 4: Find Connected Components
// ═══════════════════════════════════════════════════════════════

/**
 * Groups nodes into connected components using BFS on undirected graph.
 * 
 * @param {Set} allNodes - All nodes in the graph
 * @param {string[]} effectiveEdges - Edges that were actually used
 * @returns {Set[]} Array of Sets, each containing nodes of a component
 */
function findComponents(allNodes, effectiveEdges) {
  // Build undirected adjacency
  const undirected = new Map();
  for (const node of allNodes) {
    undirected.set(node, []);
  }
  for (const edge of effectiveEdges) {
    const [a, b] = edge.split('->');
    undirected.get(a).push(b);
    undirected.get(b).push(a);
  }

  const visited = new Set();
  const components = [];

  for (const node of allNodes) {
    if (visited.has(node)) continue;

    // BFS to find all nodes in this component
    const component = new Set();
    const queue = [node];
    visited.add(node);

    while (queue.length > 0) {
      const current = queue.shift();
      component.add(current);

      for (const neighbor of undirected.get(current)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    components.push(component);
  }

  return components;
}

// ═══════════════════════════════════════════════════════════════
// STEP 5: Process Each Component
// ═══════════════════════════════════════════════════════════════

/**
 * Processes a single connected component.
 * Determines root, detects cycles, builds tree, and calculates depth.
 * 
 * @param {Set} componentNodes - Nodes in this component
 * @param {string[]} effectiveEdges - All effective edges
 * @returns {Object} Hierarchy object for this component
 */
function processComponent(componentNodes, effectiveEdges) {
  // Filter edges belonging to this component
  const componentEdges = effectiveEdges.filter(edge => {
    const [parent] = edge.split('->');
    return componentNodes.has(parent);
  });

  // Build directed adjacency for this component
  const adj = new Map();
  const childSet = new Set();

  for (const node of componentNodes) {
    adj.set(node, []);
  }
  for (const edge of componentEdges) {
    const [parent, child] = edge.split('->');
    adj.get(parent).push(child);
    childSet.add(child);
  }

  // Find root: node that never appears as a child
  let root = null;
  const potentialRoots = [];
  for (const node of componentNodes) {
    if (!childSet.has(node)) {
      potentialRoots.push(node);
    }
  }

  if (potentialRoots.length > 0) {
    // Pick lexicographically smallest root
    potentialRoots.sort();
    root = potentialRoots[0];
  } else {
    // No node without a parent — pure cycle, use lex smallest
    const sorted = Array.from(componentNodes).sort();
    root = sorted[0];
  }

  // Cycle detection using DFS
  const hasCycle = detectCycle(adj, componentNodes);

  if (hasCycle) {
    return {
      root,
      has_cycle: true,
      tree: {}
    };
  }

  // Build tree structure (recursive)
  const tree = buildTree(root, adj);

  // Calculate depth (longest root-to-leaf path node count)
  const depth = calculateDepth(tree);

  return {
    root,
    depth,
    tree
  };
}

// ═══════════════════════════════════════════════════════════════
// Cycle Detection (DFS with coloring)
// ═══════════════════════════════════════════════════════════════

/**
 * Detects if there's a cycle in the directed graph.
 * Uses 3-color DFS: WHITE (unvisited), GRAY (in-stack), BLACK (done).
 * 
 * @param {Map} adj - Directed adjacency list
 * @param {Set} nodes - All nodes
 * @returns {boolean} True if cycle exists
 */
function detectCycle(adj, nodes) {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map();

  for (const node of nodes) {
    color.set(node, WHITE);
  }

  function dfs(node) {
    color.set(node, GRAY);

    for (const neighbor of (adj.get(node) || [])) {
      if (color.get(neighbor) === GRAY) return true;   // Back edge → cycle
      if (color.get(neighbor) === WHITE && dfs(neighbor)) return true;
    }

    color.set(node, BLACK);
    return false;
  }

  for (const node of nodes) {
    if (color.get(node) === WHITE) {
      if (dfs(node)) return true;
    }
  }

  return false;
}

// ═══════════════════════════════════════════════════════════════
// Tree Builder
// ═══════════════════════════════════════════════════════════════

/**
 * Recursively builds a nested tree object from the adjacency list.
 * 
 * @param {string} node - Current node
 * @param {Map} adj - Adjacency list
 * @returns {Object} Nested tree object
 */
function buildTree(node, adj) {
  const children = adj.get(node) || [];

  if (children.length === 0) {
    return { [node]: {} };
  }

  const childTree = {};
  // Sort children for consistent output
  const sortedChildren = [...children].sort();
  for (const child of sortedChildren) {
    Object.assign(childTree, buildTree(child, adj));
  }

  return { [node]: childTree };
}

// ═══════════════════════════════════════════════════════════════
// Depth Calculator
// ═══════════════════════════════════════════════════════════════

/**
 * Calculates the depth of a tree (number of nodes on longest root-to-leaf path).
 * 
 * @param {Object} tree - Nested tree object
 * @returns {number} Depth
 */
function calculateDepth(tree) {
  const keys = Object.keys(tree);
  if (keys.length === 0) return 0;

  let maxDepth = 0;
  for (const key of keys) {
    const childDepth = calculateDepth(tree[key]);
    maxDepth = Math.max(maxDepth, childDepth);
  }

  return 1 + maxDepth;
}

module.exports = { processHierarchy };

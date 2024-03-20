export default [
  {
    name: "Set cardinality",
    type: "definition",
    content: "Two sets $A$ and $B$ have the same cardinality if there is a bijection $f:A\\to B$.",
    dependants: [],
  },
  {
    name: "Cantor-Schröder-Bernstein theorem",
    type: "theorem",
    content: "If $|A| \\le |B|$ and $|B| \\le |A|$ then $|A| = |B|$."
  },
  {
    name: "Cantor's theorem of the power set",
    type: "theorem",
    content: "If $A$ is a set, then $|A| < \\mathcal{P}(A)$.",
    implications: [
      {
        name: "",
        type: "corollary",
        content: "For any $n\\in\\mathbb{N}\\cup\\{0\\}$, we have $n<2^n$."
      },
    ]
  },
  {
    name: "Least upper bound property",
    type: "definition",
    content: "An ordered set $S$ has the least upper bound property if every $E \\subset S$ which is nonempty and bounded above has a supremum in $S$.",
    dependants: []
  },
  {
    name: "Field",
    type: "definition",
    content: "",
    dependants: []
  },
  {
    name: "Existence and uniqueness of $\\mathbb{R}$",
    type: "theorem",
    content: "",
    dependants: []
  },
]
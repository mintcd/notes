export default [
  {
    name: "$\\sigma$-field",
    type: "definition",
    content: `A $\\sigma$-field $\\mathcal{F}$ on a set $\\Omega$ is a collection of subsets of $\\Omega$ such that
              <br/> 
                1) $\\Omega\\in\\mathcal{F}$,
              <br/>
                2) $A\\in\\mathcal{F}$ implies $A^c\\in\\mathcal{F}$,
              <br/>
                3) $\\{A_n\\}_{n=1}^{\\infty}\\subset\\mathcal{F}$ implies $\\cup_{n=1}^{\\infty}A_n\\in\\mathcal{F}$.
              `
    ,
    dependants: [],
    implications: [
      {
        name: "",
        type: "note",
        content: "In probability, $\\Omega$ is called the <i>sample space</i>, each element $\\omega\\in\\Omega$ is an <i>outcome</i> and $\\mathcal{F}$ is the set of <i>events</i>.",
        dependants: [],
      },
      {
        name: "",
        type: "example",
        content: "The Borel $\\sigma$-field on $\\mathbb{R}$, denoted by $\\mathcal{B}(\\mathbb{R})$ is the $\\sigma$-field generated by open subsets of $\\mathbb{R}$.",
        dependants: [],
      },
    ]
  },
  {
    name: "Probability",
    type: "definition",
    content: "A probability measure $\\mathbb{P}$ on a mesurable space $(\\Omega, \\mathcal{F})$ is a measure satisfying $\\mathbb{P}(\\Omega)=1$.",
    dependants: [],
    implications: [
      {
        name: "",
        type: "note",
        content: "The triplet $(\\Omega,\\mathcal{F},\\mathbb{P})$ is called a probability space. We shall use this notation from now on",
        dependants: [],
      },
    ]
  },
  {
    name: "Independence",
    type: "definition",
    content: "A family of events $\\{A_i\\}_{i\\in I}$ is independent if for any indices $i_1,\\cdots,i_k$ in $I$ ($k\\in\\mathbb{N}^*$), we have $$\\mathbb{P}(A_{i_1}\\cdots A_{i_k}) = \\mathbb{P}(A_{i_1})\\cdots \\mathbb{P}(A_{i_k})$$.",
    dependants: [],
  },
  {
    name: "Conditional probability",
    type: "definition",
    content: "",
    dependants: [],
  },
  {
    name: "Random variables and random vectors",
    type: "definition",
    content: "",
    dependants: [],
  },
  {
    name: "Distribution function",
    type: "definition",
    content: "",
    dependants: [],
  },
  {
    name: "Expectation and Conditional expectation",
    type: "definition",
    content: "",
    dependants: [],
  },
] as Statement[]
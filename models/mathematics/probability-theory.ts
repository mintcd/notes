export default [
  {
    chapterName: "Probability Space",
    notations: [
      {
        name: 'probability space',
        content: `$(\\Omega,\\F, \\PP)$`
      }
    ],
    statements: [
      {
        statementName: "Probability space",
        type: "definition",
        content: "A probability measure $\\mathbb{P}$ on a mesurable space $(\\Omega, \\mathcal{F})$ is a measure satisfying $\\mathbb{P}(\\Omega)=1$. The triplet $(\\Omega,\\mathcal{F},\\mathbb{P})$ is called a probability space.",
        dependants: [],
        implications: [
          {
            statementName: "",
            type: "note",
            content: "We open call $\\Omega$ the <i>sample space</i>, each element $\\omega\\in\\Omega$ an <i>outcome</i> and each $E\\in\\mathcal{F}$ an <i>event</i>.",
            dependants: [],
          },
          {
            statementName: "",
            type: "corollary",
            content: "Let $A$ be an event such that $\\mathbb{P}(A) > 0$. Then the function $\\mathbb{P}(\\cdot|A):\\mathcal{F}\\to\\mathbb{R}$ defined by $\\mathbb{P}(X|A)=\\dfrac{\\mathbb{P}(X\\cap A)}{\\mathbb{A}}$ is another probability measure, called the <i>probability condition on event $A$ </i>.",
            dependants: [],
          },
        ]
      },
      {
        statementName: "Independence",
        type: "definition",
        content: "A family of events $\\{A_i\\}_{i\\in I}$ is independent if for any indices $i_1,\\cdots,i_k$ in $I$ ($k\\in\\mathbb{N}^*$), we have $$\\mathbb{P}(A_{i_1}\\cdots A_{i_k}) = \\mathbb{P}(A_{i_1})\\cdots \\mathbb{P}(A_{i_k})$$.",
        dependants: [

        ],
      },
    ]
  },
  {
    chapterName: "Random Variables",
    notations: [],
    statements: [
      {
        statementName: "Random variable",
        type: "definition",
        content: "A Borel measurable function $X:\\Omega\\to\\mathbb{R}$ is called a random variable. A tuple $(X_1,\\cdots,X_n)$ of random variables is called a random vector.",
        dependants: [],
        implications: [
          {
            name: "Discrete random variable",
            type: "definition",
            content: "A random variable $X$ whose $X(\\Omega)$ is countable.",
            dependants: [],
          },
        ]
      },
      {
        statementName: "Distribution function",
        type: "definition",
        content: "The distribution function of a random variable $X$ is expressed as $F_X: \\mathbb{R}\\to [0,1]$, such that $$F_X(x) = \\mathbb{P}(X\\le x) = \\mathbb{P}(X\\in[-\\infty,x])$$",
        dependants: [],
        implications: [
          {
            statementName: "Absolutely continuous random variable",
            type: "definition",
            content: `A random variable $X$ such that there exists a Borel measurable function $f_X:\\mathbb{R}\\to\\mathbb{R}$ such that
            <br/>
            1) $f(x)\\ge0, \\forall x\\in\\mathbb{R}$;
            <br/>
            2) For any $a,b\\in\\mathbb{R}$ and $a<b$, we have $F_X(b)-F_X(a) = \\int_a^b f_X(x)\\,\\mathrm{d}x$`,
            dependants: [],
          },
        ]
      },
      {
        statementName: "Convergence of random variables",
        type: "definition",
        content: "",
        dependants: [],
        implications: [
          {
          },
        ]
      },
      {
        statementName: "Expectation and Conditional expectation",
        type: "definition",
        content: "",
        dependants: [],
      },
    ]
  },
  {
    chapterName: "Introduction to Stochastic Processes",
    notations: [],
    statements: [

    ]
  },
  {
    chapterName: "Markov Chain",
    notations: [],
    statements: [
      {
        statementName: "Discrete-time Markov property",
        type: "definition",
        content: `A sequence of random variables $(X_n)_{n\\in\\mathbb{N}}$ is a Markov chain if and only if for every $(i_0,\\cdots,i_n)\\in S^{n+1}$, we have
        $$\\PP(X_n = i_n \\,|\\, X_{n-1} = i_{n-1}, \\cdots, X_0 = i_0) = \\PP(X_n = i_n \\,|\\, X_{n-1} = i_{n-1}).$$`,
        implications: [
          {
            statementName: "Homogeneity",
            type: "definition",
            content: `The given Markov chain is homogeneous if $\\PP(X_n = i_n \\,|\\, X_{n-1} = i_{n-1})$ is independent of $n$.. Otherwise, it is inhomogeneous.`,
          },
        ]
      },
      {
        statementName: "Representation of a homogeneous Markov chain",
        type: "theorem",
        content: `A homogeneous Markov chain can be described as a triplet $(S, p^{0}, \\Pi)$ including
        </br>
        1) The state space $S$, 
        </br>
        2) The initial distribution $p^{0}=\\{p^{0}_i \\,|\\, i\\in S\\}$,
        </br>
        3) The set of transition probabilities $\\Pi = \\{p_{ij}\,|\,i,j\\in S\\}$.`,
        implications: [
          {
            statementName: "stochastic matrix",
            type: "definition",
            content: `If $S$ is discrete, we can establish a map $S\\to\\{1,\\cdots,n\\}\\subset\\NN$. Then $\\Pi$ is a stochastic matrix whose $p_{ij}$ is the $(i,j)$ entry.`,
            dependants: [],
          },
          {
            statementName: "transition after $t$ steps",
            type: "definition",
            content: `Define $\\{p_{ij}^{(t)}\\}$ to be the probability of reaching state $j$ from state $i$ after $t$ steps. By convention, $\\begin{cases}
                            p_{ij}^{(0)} = 1, \\text{ if } i = j, \\\\
                            p_{ij}^{(0)} = 0, \\text{ if } i \\ne j.
                        \\end{cases}$`,
            dependants: [],
          },
          {
            statementName: "stochastic matrix for $t$-step transitions",
            type: "theorem",
            content: `If $S=\\{1,\\cdots,n\\}$, define $\\Pi^0 = \\mathbf{I}$. Then $\\Pi^t$ contains the transition probabilities after $t$ steps.`,
            dependants: [],
          },
        ]
      },
      {
        statementName: "reachability and communicativity",
        type: "definition",
        content: `A state $j$ is reachable from a state $i$ if there exists $t\\in\\N$ such that $p_{ij}^{(t)}>0$. Two stages $i$ and $j$ communicate if they are reachable from each other.`,
        dependants: [],
        implications: [
          {
            statementName: "irreducible Markov chain",
            type: "definition",
            content: `Communicativity is an equivalence relation. Hence $S$ contains partitions of equivalence classes, called called communication classes. A Markov chain is irreducible if there exists only one partition of $S$.`,
            dependants: [],
          },
          {
            statementName: "class property",
            type: "definition",
            content: `A property $P$ is said to be a class property if whenever $i\\in S$ satisfies $P$, then $[i]$ satisfy $P$.`,
            dependants: [],
          },
        ]
      },
      {
        statementName: "Markov chain from i.i.d random variables",
        type: "theorem",
        content: `Let $(\\zeta_n)_{n\\in\\NN}$ be a sequence of i.i.d random variables in a space $\\Xi$, a map $f:\\Xi\\times S\\to S$ and a random variable $X_0$ independent of $(\\zeta_n)$. The process $(X_n)_{n\\in\\NN}$ defined by 
        $$X_{n+1} = f(X_n,\\zeta_n)$$
        is a Markov chain. Moreover, the transition probabilities are 
        $$p_{ij}=\\PP(f(i,\\zeta_1)=j).$$`,
        dependants: [],
      },
      {
        statementName: "Recurrent and transient states",
        type: "definition",
        content: `A state $s_i$ is recurrent if starting from $s_i$, one will eventually return to $s_i$. Otherwise, $s_i$ is transient.`,
        dependants: [],
      },
    ]
  },
] as Chapter[]
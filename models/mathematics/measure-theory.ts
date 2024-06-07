export default [
  {
    name: `Introduction`,
    statements: [
      {
        name: `limits of sets`,
        type: `definition`,
        content: `Given a sequence $\\{A_n\\}_{n\\in\\NN}$ of sets. We define the limit superior and limit inferior, respectively as
        $$\\limsup A_n = \\bigcap\\limits_{n=1}^{\\infty} \\left(\\bigcup\\limits_{k=n}^{\\infty} A_k\\right), \\,\\,\\,\\,
        \\liminf A_n = \\bigcup\\limits_{n=1}^{\\infty} \\left(\\bigcap\\limits_{k=n}^{\\infty} A_k\\right).$$`,
        dependants: [],
        implications: [
          {
            name: `interpretation`,
            type: `note`,
            content: `The limit superior selects elements that belong to infinitely many sets in the sequence. The limit inferior selects elements that belong to all but finitely many sets in the sequence.`,
            dependants: [],
          },
        ]
      },
      {
        name: `monotone class`,
        type: `definition`,
        content: ``,
        dependants: [],
        implications: []
      },
      {
        name: `simple function`,
        type: `definition`,
        content: `A function $f$ is simple if there exists a family of sets $\\{A_i\\}_{i=1}^n$ and a set of real numbers $\\{\\alpha\\}_{i=1}^n$ such that
        $$f(x) = \\sum\\limits_{i=1}^n \\alpha_i\\1_{A_i}(x).$$`,
        dependants: [],
        implications: [
          {
            name: ``,
            type: `proposition`,
            content: `It is possible to choose the sets in $\\{A_i\\}_{i=1}^n$ to be distinct.`,
          },
        ]
      },
    ]
  },
  {
    name: `Measure Space`,
    notations: [
      {
        name: `\\sigma-algebra`,
        content: `\\F`
      },
    ],
    statements: [
      {
        name: `$\\sigma$-algebra`,
        type: `definition`,
        content: `A $\\sigma$-algebra, or $\\sigma$-field $\\mathcal{F}$ on a set $\\Omega$ is a collection of subsets of $\\Omega$ such that
                  <br/> 
                    1) $\\Omega\\in\\mathcal{F}$,
                  <br/>
                    2) $A\\in\\mathcal{F}$ implies $A^c\\in\\mathcal{F}$,
                  <br/>
                    3) $\\{A_n\\}_{n\\in\\NN}\\subset\\mathcal{F}$ implies $\\cup_{n=1}^{\\infty}A_n\\in\\mathcal{F}$.
                  <br/>
                  The doublet $(\\Omega,\\F)$ is called a measurable space.
                  `,
        dependants: [],
        implications: [
          {
            name: `properties`,
            type: `theorem`,
            content: `1) $\\varnothing\\in\\F$
                      </br>
                      2) $\\{A_n\\}_{n\\in\\NN}\\subset\\mathcal{F}$ implies $\\cap_{n=1}^{\\infty}A_n\\in\\mathcal{F}$`,
            dependants: [],
          },
          {
            name: `interpretation`,
            type: `note`,
            content: `A $\\sigma$-field is an algebraic structure that is closed under complement, countable union and countable intersection.`,
            dependants: [],
          },
          {
            name: ``,
            type: `proposition`,
            content: `Let $\\{\\F_i\\}_{i\\in\\I}$ be a family of $\\sigma$-algebras. Then $\\bigcap\\limits_{i\\in\\I} \\F_i$ is a $\\sigma$-algebra.`,
            dependants: [],
          },
        ]
      },
      {
        name: `generated $\\sigma$-algebra`,
        type: `theorem`,
        content: `If $\\C$ is a subset of $2^\\Omega$, there exists a smallest $\\sigma$-algebra containing $\\C$, called the $\\sigma$-algebra generated by $\\C$ and denoted by $\\sigma(\\C)$.`,
        dependants: [],
        implications: [
          // {
          //   name: ``,
          //   type: `note`,
          //   content: `Let $\\F_1, \\cdots,\\F_n$ be $\\sigma$-algebra on $\\Omega$, we write
          //             $$\\F_1\\otimes\\cdots\\otimes\\F_n := \\sigma(\\F_1\\cup\\cdots\\cup\\F_n)$$.`,
          //   dependants: [],
          // },
        ]
      },
      {
        name: `Borel $\\sigma$-algebra`,
        type: `definition`,
        content: `The Borel $\\sigma$-algebra on a topological space $X$, denoted by $\\mathcal{B}(X)$, is the $\\sigma$-field generated by open subsets of $X$.`,
        dependants: [],
      },
      {
        name: `measure`,
        type: `definition`,
        content: `Let $(\\Omega,\\F)$ be a measurable space. A measure is a function $\\mu:\\F\\to[0,\\infty]$ such that
                  </br>
                  1) $\\mu(\\varnothing) = 0$
                  </br>
                  2) ($\\sigma$-addictivity) For every family $\\{A_i\\}_{i\\in\\N}$ of disjoint measurable subsets, we have
                  $$\\mu\\left(\\bigcup\\limits_{i=1}^\\infty A_i\\right) = \\sum\\limits_{i=1}^\\infty \\mu(A_i).$$`,
        dependants: [],
        implications: [
          {
            name: ``,
            type: `definition`,
            content: `The triplet $(\\Omega,\\F,\\mu)$ is called a measure space. The quantity $\\my(\\Omega)$ is called the total mass of the measure $\\mu$.`,
            dependants: [],
          },
        ]
      },
      {
        name: ``,
        type: `theorem`,
        content: `1) $\\mu(\\liminf A_n) \\le \\liminf\\mu(A_n)$. 
                  </br>
                  2) If $\\mu\\left(\\bigcup\\limits_{n=1}^\\infty A_n\\right)<\\infty$, then $\\mu(\\limsup A_n) \\ge \\limsup\\mu(A_n)$`,
        dependants: [],
      },
      {
        name: `Almost Everywhere`,
        type: `definition`,
        content: `A property $P:\Omega\to \{0,1\}$ is said to hold almost everywhere with respect to the measure $\\mu$ if
        $$\\mu\\{\\omega\\in\\Omega: P(\\}$$`,
        dependants: [],
      },
    ]
  },
  {
    name: `Measurable Functions`,
    notations: [],
    statements: [
      {
        name: `measurable function`,
        type: `definition`,
        content: `Let $(\\Omega, \\F)$ and $(\\Gamma, \\G)$ be mesurable spaces. A function $f:\\Omega\\to\\Gamma$ is measurable $\\F\\to\\G$ if 
        $$\\forall G\\in\\G, f^{-1}(G)\\in\\F.$$
        If $\\B$ has been explicated, we say that $f$ is $\\F$-measurable.`,
        dependants: [],
      },
      {
        name: `measurable criterion`,
        type: `proposition`,
        content: `If there is a subset $\\C$ of $2^\\Omega$ such that $\\G = \\sigma(\\C)$ and 
        $$\\forall G\\in\\G, f^{-1}(G)\\in\\C.$$
        Then $f$ is measurable.`,
        dependants: [],
      },
    ],
  },
  {
    name: `Integration`,
    notations: [],
    statements: [
      {
        name: `Integral of simple functions`,
        type: `definition`,
        content: `Let $f(x) = \\sum\\limits_{i=1}^n \\alpha_i\\1_{A_i}(x)$ be a simple function taking values in $\\R_+$, where $\\{A_i\\}_{i=1}^n\\subset\\F$. The integral of $f$ relative to a measure $\\mu$ is defined by
        $$\\int f\\,\\d\\mu = \\sum\\limits_{i=1}^n \\alpha_i\\mu(A_i).$$
        By convention, $\\alpha_i\\mu(A_i)=0$ if $\\alpha_i=0$ and $\\mu(A_i)=0=\\infty$.`,
        dependants: [],
        implications: [
          {
            name: ``,
            type: `note`,
            content: `Let us denote by $\E_+$ the set of non-negative simple functions.`,
          },
        ]
      },
      {
        name: `Integral of non-negative measurable functions`,
        type: `definition`,
        content: `Let $f:\\Omega\\to[0,\\infty]$ be measurable. The integral of $f$ relative to a measure $\\mu$ is defined by
        $$\\int f\\,\\d\\mu = \\sup\\limits_{h\\in\\E_+, h\\le f} \\int h\\,\\d\\mu.$$`,
        dependants: [],
        implications: []
      },
      {
        name: `Integral of measurable functions`,
        type: `definition`,
        content: `Let $f:\\Omega\\to\\RR$ be measurable. Define $f^+=\\sup\\{f,0\\}$ and $f^+=\\sup\\{-f,0\\}$. The integral of $f$ relative to a measure $\\mu$ is defined by
        $$\\int f\\,\\d\\mu = \\int f^+\\,\\d\\mu - \\int f^-\\,\\d\\mu,$$
        if the right-hand side exists i.e. $\\int |f|\\,\\d\\mu < \\infty$.`,
        dependants: [],
        implications: [
          {
            name: `integrable functions`,
            type: `note`,
            content: `If $\\int |f|\\,\\d\\mu < \\infty$, then $f$ is said to be $\\L^1$-integrable. More restriction on integrability forms the classes $\\L^n$, to be later encountered.`,
            dependants: [],
          },
        ]
      },
      {
        name: `Monotonicity of the Integral`,
        type: `lemma`,
        content: `If $$`,
      },
      {
        name: `Monotone Convergence Theorem`,
        type: `theorem`,
        content: ``,
        dependants: [],
        implications: [
          {
            name: `integrable functions`,
            type: `note`,
            content: `If $\\int |f|\\,\\d\\mu < \\infty$, then $f$ is said to be $\\L^1$-integrable. More restriction on integrability forms the classes $\\L^n$, to be later encountered.`,
            dependants: [],
          },
        ]
      },
    ]
  }
] as unknown as Chapter[]
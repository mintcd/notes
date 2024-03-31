'use client'

import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

const MyLatex = ({ children }: { children: string | undefined }) => {
  const macros: { [key: string]: string; } = {
    "\\EE": "\\mathbb{E}",
    "\\NN": "\\mathbb{N}",
    "\\PP": "\\mathbb{P}",
    "\\QQ": "\\mathbb{Q}",
    "\\RR": "\\mathbb{R}",
    "\\VV": "\\mathbb{V}",

    "\\B": "\\mathcal{B}",
    "\\F": "\\mathcal{F}",
  };

  return <Latex macros={macros}>{children}</Latex>;
};

export default MyLatex;

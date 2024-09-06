'use client'
import { useRef, useEffect, useState, RefObject } from 'react';
import { createRoot } from 'react-dom/client';

import CenterFocusStrongRoundedIcon from '@mui/icons-material/CenterFocusStrongRounded';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { select } from 'd3-selection'
import { drag } from 'd3-drag'
import { zoom, zoomIdentity, zoomTransform, ZoomBehavior } from 'd3-zoom'
import { forceSimulation, forceLink, forceCenter, forceCollide, forceRadial, forceManyBody } from 'd3-force';
import graphData from '@models/knowledge-graph'


import { statementProps } from '@styles/statement-props';
import Latex from '@components/latex';
import VertexContent from '@components/statement-content';
import { breakLinesForCircle, getEdges, initiateLayout, computeNodeDepths, getVerticesOfTopic } from '@functions/graph-analysis';

export default function KnowledgeGraph() {
  const contentRef = useRef(null);
  const containerRef = useRef<SVGSVGElement>(null);
  const dropdownRef = useRef(null);
  const environmentRef: RefObject<HTMLDivElement> = useRef(null);

  const [graphRendered, setGraphRendered] = useState(false)
  const [shownContent, setShownContent] = useState<Vertex | undefined>(undefined)
  const [isOpen, setIsOpen] = useState(false);

  const [selectedField, setSelectedField] = useState<Field | "all-fields">('all-fields');

  const fields = [
    { value: "all-fields", label: "All Fields" },
    { value: "measure-theory", label: "Measure Theory" },
    { value: "real-analysis", label: "Real Analysis" },
    { value: "probability-theory", label: "Probability Theory" },
  ];

  const [params, setParams] = useState({
    width: 500,
    height: 500,
    radius: 10,
    fontSize: 3
  })

  let vertices = graphData.vertices
  if (selectedField !== "all-fields") {
    vertices = getVerticesOfTopic(graphData.vertices, [selectedField])
  }
  // vertices = computeNodeDepths(vertices)
  vertices = initiateLayout(vertices, 2 * params.radius, 2 * params.radius)

  let edges = getEdges(vertices);

  useEffect(() => {
    setSelectedField(window.localStorage.getItem('selectedField') as Field || 'all-fields')
    const updateSize = () => {
      if (environmentRef.current) {
        const { width, height } = environmentRef.current.getBoundingClientRect();
        setParams({ width: width, height: width, radius: width / 50, fontSize: width / 200 });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Hook for SVG Graph Rendering
  useEffect(() => {
    // Select the graph container
    const graphContainer = select(containerRef.current as SVGSVGElement)
      .attr('width', params.width)
      .attr('height', params.height)

    // Add graph from container
    const graph = graphContainer.select(".graph")

    /////////////////////////////// Marker Styles /////////////////////////////////////////////////////////
    const markerStyles = graph.append("svg:defs")
    const markerSize = params.fontSize;

    const defaultMarker = markerStyles.append("svg:marker")
      .attr("id", "arrow")
      .attr("viewBox", `0 -${markerSize / 2} ${markerSize} ${markerSize}`)
      .attr("refX", markerSize)
      .attr("markerWidth", markerSize)
      .attr("markerHeight", markerSize)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", `M0,-${markerSize / 2}L${markerSize},0L0,${markerSize / 2}`)
      .style("fill", "#aaa");

    const specializesMarker = markerStyles.append("svg:marker")
      .attr("id", "arrow-specializes")
      .attr("viewBox", `0 -${markerSize / 2} ${markerSize} ${markerSize}`)
      .attr("refX", markerSize)
      .attr("markerWidth", markerSize)
      .attr("markerHeight", markerSize)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", `M0,0 L${markerSize / 2},-${markerSize / 2} L${markerSize},0 L${markerSize / 2},${markerSize / 2} Z`)
      .style("fill", "#aaa");

    const links = graph.selectAll("line")
      .data(edges)
      .enter()
      .append("line")
      .style("stroke", function (d) {
        const edge = d as Edge;
        return edge.relation && edge.relation === 'specializes' ? "#aaa" : "#aaa";
      })
      .attr("marker-end", function (d) {
        const edge = d as Edge;
        return edge.relation && edge.relation === 'specializes' ? "url(#arrow-specializes)" : "url(#arrow)";
      });


    const linkText = graph.append("g")
      .attr("class", "link-texts")
      .selectAll("text")
      .data(edges)
      .enter()
      .append("text")
      .attr("class", "link-text")
      .attr("dy", -5)
      .attr("text-anchor", "middle")
      .text(function (d) {
        const edge = d as Edge;
        // return edge.relation !== undefined ? edge.relation : '';
        return ''
      });

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const nodes = graph
      .selectAll(".node")
      .data(vertices)
      .enter()
      .append("g")
      .attr("class", "node")

    const gradients = graph.append('defs')
      .append('linearGradient')
      .attr('id', 'definition-theorem')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    gradients.append('stop')
      .attr('offset', '0%')
      .style('stop-color', '#0288d1');

    gradients.append('stop')
      .attr('offset', '100%')
      .style('stop-color', '#5bb561');

    const shapes = nodes.append("circle")
      .attr("class", "shape")
      .attr("r", params.radius)
      .attr("stroke", "none")
      .attr("fill", function (d) {
        const v = d as Vertex
        return v.color ? v.color : statementProps[v.type].color
      })
      .style("opacity", (v: Vertex) => {
        return (v.parents === undefined || v.parents.length === 0) ? 1 : 0.7
      })


    const foreignObjects = nodes
      .append("foreignObject")
      .style('width', 2 * params.radius)
      .style('height', 2 * params.radius)
      .attr("x", -params.radius)
      .attr("y", -params.radius);

    foreignObjects.append("xhtml:div")
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("align-items", "center")
      .style("justify-content", "center")
      .style("width", "100%")
      .style("height", "100%")
      .style("color", "white")
      .style("font-size", `${params.fontSize}px`)
      .each(function (this, d) {
        const v = d as Vertex
        const container = this as HTMLElement
        createRoot(container).render(
          <div className={`text-center w-full hover:font-bold hover:cursor-pointer`}
            onClick={() => setShownContent(v)}
          >
            {breakLinesForCircle(v, params.radius).map((line, i) => (
              <Latex key={i}>
                {line}
              </Latex>
            ))
            }
          </div>
        );
      })

    /////////////////////////// Simulation //////////////////////////////////////
    const simulation = forceSimulation(vertices)
    simulation.alphaDecay(0.5)
      .force('center', forceCenter(params.width / 2, params.height / 2))
      .force('link', forceLink(edges)
        .distance(params.radius)
        .id(function (node) {
          const v = node as Vertex
          return v.key ? v.key : ''
        }))
      .force('collide', forceCollide(1.5 * params.radius))

    simulation.on("tick", () => {
      nodes.attr("transform", function (d) {
        const v = d as Vertex;

        // Ensure x is within bounds
        v.x = Math.max(params.radius, Math.min(params.width - params.radius, v.x || 0));
        v.y = Math.max(params.radius, Math.min(params.height - params.radius, v.y || 0));

        return `translate(${v.x},${v.y})`;
      });

      links
        .attr("x1", (d) => {
          const edge = d as any
          const angle = Math.atan2(edge.target.y - edge.source.y, edge.target.x - edge.source.x);
          return edge.source.x + params.radius * Math.cos(angle);
        })
        .attr("y1", (d) => {
          const edge = d as any
          const angle = Math.atan2(edge.target.y - edge.source.y, edge.target.x - edge.source.x);
          return edge.source.y + params.radius * Math.sin(angle);
        })
        .attr("x2", (d) => {
          const edge = d as any
          const angle = Math.atan2(edge.source.y - edge.target.y, edge.source.x - edge.target.x);
          return edge.target.x + params.radius * Math.cos(angle);
        })
        .attr("y2", (d) => {
          const edge = d as any
          const angle = Math.atan2(edge.source.y - edge.target.y, edge.source.x - edge.target.x);
          return edge.target.y + params.radius * Math.sin(angle);
        });

      linkText
        .attr("x", function (d) {
          const edge = d as any
          return (edge.source.x + edge.target.x) / 2
        })
        .attr("y", function (d) {
          const edge = d as any
          return (edge.source.y + edge.target.y) / 2
        });

    })

    //////////////// Drag behaviors ////////////////////////////////////////////////////

    const nodeDrag = drag()
      .on("start", function dragStartedHandler(event, d) {
        const v = d as Vertex;
        v.fx = v.x;
        v.fy = v.y;
      })
      .on("drag", function draggingHandler(event, d) {
        const v = d as Vertex;
        v.fx = event.x;
        v.fy = event.y;
        simulation.alphaTarget(0).restart()
      })
      .on("end", function dragEndedHandler(event, d) {
        const v = d as Vertex;
        if (!event.active) simulation.alphaTarget(0);
        v.fx = undefined;
        v.fy = undefined;
      });

    nodes.call(nodeDrag as any)



    return () => {
      setGraphRendered(true)
      graph.selectAll('*').remove();
      simulation.stop();
    };
  }, [graphRendered, selectedField]);

  useEffect(() => {
    const graphContainer = select(containerRef.current as SVGSVGElement)
    const graph = select(".graph")
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .filter((event) => {
        // Allow zooming on wheel events and not on other events like drag
        return event.type === 'wheel' || event.type === 'dblclick';
      })
      .on('zoom', (event) => {
        graph.attr('transform', event.transform);
      });

    const handleZoom = (event: WheelEvent) => {

      event.preventDefault();

      const graphContainer = select(containerRef.current as SVGSVGElement);
      const currentTransform = zoomTransform(containerRef.current as SVGSVGElement);
      const sensitivity = 0.001;

      const svgBounds = (containerRef.current as SVGSVGElement).getBoundingClientRect();
      const mouseX = event.clientX - svgBounds.left;
      const mouseY = event.clientY - svgBounds.top;

      const scaleFactor = 1 - event.deltaY * sensitivity;
      const newScale = currentTransform.k * scaleFactor;
      const constrainedScale = Math.max(0.1, Math.min(newScale, 3));

      const x = currentTransform.x;
      const y = currentTransform.y;
      const k = currentTransform.k;

      const newX = mouseX - (mouseX - x) * (constrainedScale / k);
      const newY = mouseY - (mouseY - y) * (constrainedScale / k);

      const newTransform = zoomIdentity
        .translate(newX, newY)
        .scale(constrainedScale);

      graphContainer
        .transition()
        .duration(50)
        .call(zoomBehavior.transform as any, newTransform);
    };

    const resetZoom = () => {
      graphContainer.transition()
        .duration(100)
        .call(zoomBehavior.transform as any, zoomIdentity);
    };

    const resetButton = select('#reset-button')
    resetButton.on('click', resetZoom);

    graphContainer.call(zoomBehavior as any)
      .on("wheel.zoom", handleZoom)

  })

  useEffect(() => {
    if (graphRendered) {
      const graphContainer = select(containerRef.current as SVGSVGElement);
      graphContainer.selectAll(".shape")
        .style("opacity", (d) => {
          const v = d as Vertex
          return shownContent !== undefined && v.name === shownContent.name ? 1 : 0.7;
        });
    }
  }, [shownContent, graphRendered]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !(dropdownRef.current as HTMLElement).contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function escHandler(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', escHandler);

    // Clean up

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', escHandler);
    };

  });


  return (
    <div className='sm:grid grid-cols-6 place-items-center'>
      <div ref={dropdownRef} id='select' className=' col-span-4 mb-4 w-48'>
        <div
          className="bg-white border border-gray-300 rounded-md p-2 flex justify-between items-center cursor-pointer col-span-4"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-gray-700">
            {fields.find(f => f.value === selectedField)?.label}
          </span>
          <ArrowDropDownIcon className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
        </div>
        {isOpen && (
          <div className="absolute w-48 bg-white border border-gray-300 mt-1 rounded-md shadow-lg z-10">
            {fields.map((field) => (
              <div
                key={field.value}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedField(field.value as Field | "all-fields");
                  localStorage.setItem('selectedField', field.value)
                  setIsOpen(false);
                }}
              >
                {field.label}
              </div>
            ))}
          </div>
        )}
      </div>
      <div ref={environmentRef} className={`col-span-4 w-full
                      flex flex-col items-center justify-center 
                     overflow-hidden`}>
        <div className='bg-gray-200 rounded-3xl'>
          <svg ref={containerRef} className='graph-container'>
            <foreignObject id='reset-button' className='cursor-pointer w-[50px] h-[50px] translate-x-[25px] translate-y-[25px]'>
              <CenterFocusStrongRoundedIcon className={`w-${params.width / 20} h-${params.height / 20}`} />
            </foreignObject>
            <g className='graph'></g>
          </svg>
        </div>
      </div>
      <div
        className={`col-span-2 z-50 rounded-3xl sm:mt-0 sm:ml-5 mt-5
                      text-gray-800 w-full h-full`}
        ref={contentRef}>
        <VertexContent statement={shownContent} />
      </div>
    </div >
  );
};
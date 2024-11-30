'use client'

import { useEffect, useMemo } from "react";
import { initializeAttrsByName, sortData, updateFilter } from "./functions.ts";
import { useMediaQuery } from "@uidotdev/usehooks";
import { createFactory } from "@functions/objects.ts";

import { IoMdAdd } from "react-icons/io";
import { MdNavigateNext, MdNavigateBefore, MdLastPage, MdFirstPage } from "react-icons/md";

import TableHeaderGroup from "./table-header-group/TableHeaderGroup.tsx";
import TableBody from "./table-body/TableBody.tsx";
import TableExtension from "./table-extension/TableExtension.tsx";

export default function Table({ name, upToDate, data, attrs, onUpdateCell, onCreateItem, onReorder }:
  {
    name: string,
    upToDate: boolean,
    data: DataItem[],
    attrs: AttrProps[],
    onUpdateCell: (items: UpdatedItem | UpdatedItem[]) => Promise<void>,
    onCreateItem: () => void,
    onReorder: (rangedItems: DataItem[], direction: 'up' | 'down') => void,
  }) {

  const isMobileDevice = useMediaQuery("only screen and (max-width : 768px)");

  const factory: Factory<TableProps> = createFactory(() => {
    const storeProps = localStorage.getItem('tableProps')
    return (storeProps
      ? JSON.parse(storeProps)
      : {
        name: name,
        itemsPerPage: 10,
        currentPage: 1,
        upToDate: upToDate,
        searchString: "",
        attrsByName: initializeAttrsByName(attrs, data),
        style: { cellMinWidth: 100, optionsColumnWidth: 75 }
      }) as TableProps
  })

  const processedDesktopData = useMemo(() => {
    let processedData = data
      // Filter
      .filter(item => (
        Object.values(factory.attrsByName)
          .every((attr) =>
          (
            attr.filter.enabled === false
            || item[attr.name].length === 0
            || Object.entries(attr.filter.predicates).every(([predName, candidates]) => {
              if (predName === 'is' && attr.type === 'multiselect') {
                if (candidates === undefined || candidates.length === 0) return true;

                // Ensure item[attrName] exists and is an array before checking
                if (Array.isArray(item[attr.name])) {
                  // Return true if any value in item[attrName] is included in candidates
                  return item[attr.name].some((value: string) => candidates.includes(value));
                }

                // If item[attrName] is not an array, return false
                return false;
              }

              if (predName === 'contains' && attr.type === 'text') {
                const value = item[attr.name] as string
                const candidate = candidates as string

                return value.toLowerCase().includes(candidate.toLowerCase())
              }
              return true; // Default return true if no predicates are matched
            })
          )
          )
      ))
      // Search
      .filter(item => Object.values(factory.attrsByName).some(attr => {
        const value = item[attr.name]
        if (typeof value === 'string') {
          return value.includes(factory.searchString)
        }

        if (Array.isArray(value)) {
          return value.flatMap(x => x).includes(factory.searchString)
        }
      }))
    // Apply sorting
    Object.values(factory.attrsByName).forEach(prop => {
      processedData = sortData(processedData, prop.name, prop.sort)
    })
    factory.set("currentPage", 1)
    return processedData
  }, [data, factory.attrsByName, factory.searchString])

  const totalPages = useMemo(() => {
    return Math.ceil(processedDesktopData.length / factory.itemsPerPage)
  }, [processedDesktopData, factory.itemsPerPage])


  const paginatedData = useMemo(() => {
    const startIndex = (factory.currentPage - 1) * factory.itemsPerPage
    const endIndex = Math.min(startIndex + factory.itemsPerPage, processedDesktopData.length);
    return processedDesktopData.slice(startIndex, endIndex)
  }, [processedDesktopData, factory.itemsPerPage, factory.currentPage])

  // Effects
  useEffect(() => {
    //Store attrsByName every time it changes
    localStorage.setItem('tableProps', JSON.stringify(factory.get()));
  }, [factory])

  useEffect(() => {
    // Refetch suggestions every time data changes
    factory.set('attrsByName', function () {
      let newAttrsByName = { ...factory.attrsByName }
      Object.values(factory.attrsByName).filter(attr => attr.type !== 'text').forEach(attr => {
        newAttrsByName[attr.name].suggestions =
          Array.from(new Set(data.flatMap(item => attr.referencing
            ? item[attr.referencing]
            : item[attr.name])))
            .sort()
      })
      return newAttrsByName
    }())
  }, [data])

  return (
    isMobileDevice
      ?
      <div>
        {/* <TableExtension
          factory={factory}
        />
        <div>
          {processedMobileData.length > 0 ?
            Object.entries(processedMobileData[0]).map(([key, value]) => (
              <div className="grid grid-cols-[70px,1fr] border-b border-b-gray-300 rounded-md"
                key={key}>
                <div className="p-2 border-r border-r-gray-300">
                  {attrsByName[key].display}
                </div>
                <TableCell
                  itemId={processedMobileData[0].id}
                  attr={attrsByName[key]}
                  onUpdate={(item) => {
                    onUpdateCell(item)
                    if (key === 'name') setSearchString(item.attrValue.name)
                  }}
                  value={value}
                  suggestions={attrsByName[key].suggestions}
                />
              </div>
            )) :
            <div className="text-center italic"> No item found </div>
          }
        </div>
        <div className="flex items-center rounded-md hover:bg-[#f0f0f0] py-1 px-2 cursor-pointer"
          onClick={onCreateItem}>
          <AddRounded className={`icon`} />
          <span>New </span>
        </div> */}

      </div>
      :
      <div className="table-container flex flex-col relative">
        <TableExtension
          factory={factory}
          data={data}
        />

        <div className="table-content rounded-md shadow-md">
          <TableHeaderGroup
            factory={factory}
          />

          <TableBody
            data={paginatedData}
            factory={factory}
            handlers={{
              updateCell: onUpdateCell,
              reorder: onReorder
            }}
          />
        </div>

        <div className="table-footer flex items-center justify-between text-[#023e8a]">
          <div className="flex items-center rounded-md hover:bg-[#f0f0f0] py-1 px-2 cursor-pointer"
            onClick={() => {
              onCreateItem()
              factory.set("searchString", "")
            }}>
            <IoMdAdd className={`icon`} />
            <span> New </span>
          </div>

          <div className="pagination-controls flex items-center justify-end">
            <MdFirstPage
              className="icon"
              opacity={factory.currentPage > 1 ? 1 : 0.6}
              onClick={() => factory.currentPage > 1 && factory.set("currentPage", 1)}
            />
            <MdNavigateBefore
              className="icon"
              opacity={factory.currentPage > 1 ? 1 : 0.6}
              onClick={() => factory.currentPage > 1 && factory.set("currentPage", factory.currentPage - 1)}
            />
            <span className="pagination-info">
              {(factory.currentPage - 1) * factory.itemsPerPage + 1} - {Math.min(factory.currentPage * factory.itemsPerPage, processedDesktopData.length)} of {processedDesktopData.length}
            </span>
            <MdNavigateNext
              className="icon"
              opacity={factory.currentPage < totalPages ? 1 : 0.6}
              onClick={() => factory.currentPage < totalPages && factory.set("currentPage", factory.currentPage + 1)}
            />
            <MdLastPage
              className="icon"
              opacity={factory.currentPage < totalPages ? 1 : 0.6}
              onClick={() => factory.currentPage < totalPages && factory.set("currentPage", totalPages)}
            />
          </div>
        </div>
      </div>
  );
}

'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: { pageSize: 8 },
    },
  });

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center ">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={searchPlaceholder}
              value={
                (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
              }
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="pl-10 bg-white  border-slate-300"
            />
          </div>
        </div>
      )}

      {/* Added 'border-separate border-spacing-0' to handle double borders correctly */}
      <div className="rounded-lg border border-slate-200 bg-white  overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
        <Table className="border-collapse">
          <TableHeader className="bg-blue-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    // Added border-r (right) and border-b (bottom)
                    className="text-slate-600 text-center font-semibold  py-1 border-r border-b border-slate-200 last:border-r-0"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      // Added border-r (right) and border-b (bottom)
                      className="text-center py-1 border-r border-b border-slate-200 last:border-r-0 last:border-b-0"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-slate-400"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-slate-500">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// NEW UI
// 'use client';

// import * as React from 'react';
// import {
//   ColumnDef,
//   ColumnFiltersState,
//   SortingState,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from '@tanstack/react-table';

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

// interface DataTableProps<TData, TValue> {
//   columns: ColumnDef<TData, TValue>[];
//   data: TData[];
//   searchKey?: string;
//   searchPlaceholder?: string;
// }

// export function DataTable<TData, TValue>({
//   columns,
//   data,
//   searchKey,
//   searchPlaceholder = 'Search...',
// }: DataTableProps<TData, TValue>) {
//   const [sorting, setSorting] = React.useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
//     [],
//   );

//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     onSortingChange: setSorting,
//     getSortedRowModel: getSortedRowModel(),
//     onColumnFiltersChange: setColumnFilters,
//     getFilteredRowModel: getFilteredRowModel(),
//     state: {
//       sorting,
//       columnFilters,
//     },
//     initialState: {
//       pagination: { pageSize: 8 },
//     },
//   });

//   return (
//     <div className="space-y-4">
//       {/* --- Search Section --- */}
//       {searchKey && (
//         <div className="flex items-center justify-between gap-4">
//           <div className="relative flex-1 max-w-sm group">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
//             <Input
//               placeholder={searchPlaceholder}
//               value={
//                 (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
//               }
//               onChange={(event) =>
//                 table.getColumn(searchKey)?.setFilterValue(event.target.value)
//               }
//               className="pl-10 bg-white border-slate-200 focus-visible:ring-blue-500 shadow-sm transition-all"
//             />
//           </div>
//         </div>
//       )}

//       {/* --- Table Container --- */}
//       <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
//         <Table>
//           <TableHeader className="bg-slate-50/80 border-b border-slate-200">
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow
//                 key={headerGroup.id}
//                 className="hover:bg-transparent border-none"
//               >
//                 {headerGroup.headers.map((header) => (
//                   <TableHead
//                     key={header.id}
//                     className="h-11 text-slate-500 text-center font-bold text-xs uppercase tracking-wider py-2 border-r border-slate-200/60 last:border-r-0"
//                   >
//                     {header.isPlaceholder
//                       ? null
//                       : flexRender(
//                           header.column.columnDef.header,
//                           header.getContext(),
//                         )}
//                   </TableHead>
//                 ))}
//               </TableRow>
//             ))}
//           </TableHeader>

//           <TableBody>
//             {table.getRowModel().rows?.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow
//                   key={row.id}
//                   className="group hover:bg-blue-50/30 transition-colors border-b border-slate-100 last:border-0"
//                 >
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell
//                       key={cell.id}
//                       className="py-3 px-4 text-center border-r border-slate-100 last:border-r-0 group-hover:border-blue-100/50 transition-colors"
//                     >
//                       <div className="text-sm text-slate-700">
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext(),
//                         )}
//                       </div>
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="h-48 text-center"
//                 >
//                   <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
//                     <Inbox className="h-8 w-8 stroke-[1.5]" />
//                     <p className="text-sm font-medium">No results found.</p>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>

//         {/* --- Integrated Footer/Pagination --- */}
//         <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-t border-slate-200">
//           <div className="flex-1 text-sm text-slate-500 font-medium">
//             Page{' '}
//             <span className="text-slate-900">
//               {table.getState().pagination.pageIndex + 1}
//             </span>{' '}
//             of <span className="text-slate-900">{table.getPageCount()}</span>
//           </div>

//           <div className="flex items-center space-x-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => table.previousPage()}
//               disabled={!table.getCanPreviousPage()}
//               className="h-8 px-2 border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 shadow-xs"
//             >
//               <ChevronLeft className="h-4 w-4 mr-1" />
//               Previous
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => table.nextPage()}
//               disabled={!table.getCanNextPage()}
//               className="h-8 px-2 border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 shadow-xs"
//             >
//               Next
//               <ChevronRight className="h-4 w-4 ml-1" />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

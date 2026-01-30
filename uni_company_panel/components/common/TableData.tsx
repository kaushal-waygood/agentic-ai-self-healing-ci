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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const [rowSelection, setRowSelection] = React.useState({});
  const [isSpacious, setIsSpacious] = React.useState(true);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    // 2. Enable row selection
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },

    initialState: {
      pagination: { pageSize: 8 },
    },
  });

  const renderPageNumbers = () => {
    const pageCount = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex;
    const pages = [];

    // Logic: Always show first page, last page, and pages around current page
    for (let i = 0; i < pageCount; i++) {
      if (
        i === 0 || // First page
        i === pageCount - 1 || // Last page
        (i >= currentPage - 1 && i <= currentPage + 1) // Pages around current
      ) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? 'default' : 'outline'}
            size="sm"
            onClick={() => table.setPageIndex(i)}
            className={cn(
              'h-9 w-9 p-0 font-medium transition-all',
              currentPage === i
                ? 'bg-blue-500 hover:bg-blue-600 border-blue-500 text-white'
                : 'bg-white border-slate-200 text-slate-600',
            )}
          >
            {i + 1}
          </Button>,
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        // Add ellipsis if there's a gap
        pages.push(
          <span key={i} className="px-2 text-slate-400">
            ...
          </span>,
        );
      }
    }
    return pages;
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {searchKey && (
          <div className="flex flex-1 items-center ">
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

        {/* 3. Show Bulk Actions if items are selected */}
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="animate-in fade-in zoom-in duration-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected (
                {table.getFilteredSelectedRowModel().rows.length})
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">
                  Confirm Bulk Deletion
                </h4>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete{' '}
                  {table.getFilteredSelectedRowModel().rows.length} selected
                  job(s)? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const selectedIds = table
                        .getFilteredSelectedRowModel()
                        .rows.map((row) => (row.original as any)._id);
                      console.log('Executing Bulk Delete for:', selectedIds);
                      toast.success('Selected Delete Executed!');

                      // Call your backend API here via useJobStore
                      table.resetRowSelection();
                    }}
                  >
                    Confirm Bulk Delete
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        {/* Dense Mode Toggle */}
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <Switch
            id="view-mode"
            checked={isSpacious}
            onCheckedChange={setIsSpacious}
            className="data-[state=checked]:bg-blue-500"
          />
          <Label
            htmlFor="view-mode"
            className="text-xs font-medium text-slate-600 cursor-pointer select-none"
          >
            Spacious
          </Label>
        </div>
      </div>

      {/* Added 'border-separate border-spacing-0' to handle double borders correctly */}
      <div className="rounded-lg border border-slate-200 bg-white  overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
        <Table className="border-collapse border-blue-200 border-2">
          <TableHeader className="bg-blue-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'text-slate-600 text-center font-semibold border-r border-b border-slate-200 last:border-r-0',
                      isSpacious ? 'py-3 text-sm' : 'py-1 text-xs',
                    )}
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
                      className={cn(
                        'text-center border-r border-b border-slate-200 last:border-r-0 last:border-b-0',
                        isSpacious ? 'py-3 text-sm' : 'py-1 text-xs', // Standard view vs Dense view
                      )}
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
      {/* old pagination ui  */}
      {/* <div className="flex items-center justify-between px-2">
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
      </div> */}

      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 bg-slate-50/50 border-t border-slate-200 gap-4">
        {/* Left: Total Result Info */}
        {/* Left Section: Result Info & Page Size Selector */}
        <div className="flex items-center gap-4 order-2 sm:order-1">
          <div className="text-sm text-slate-500 font-medium">
            Showing{' '}
            <span className="text-slate-900">
              {table.getRowModel().rows.length}
            </span>{' '}
            of <span className="text-slate-900">{data.length}</span> results
          </div>

          <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
            <p className="text-sm text-slate-500 font-medium whitespace-nowrap">
              Rows per page
            </p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px] bg-white border-slate-200">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[8, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Center: Numbered Pagination with Ellipsis */}
        <div className="flex items-center gap-1 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-9 w-9 p-0 border-slate-200 bg-white hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {renderPageNumbers()}

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-9 w-9 p-0 border-slate-200 bg-white hover:bg-slate-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Right: Current Page Info */}
        <div className="hidden sm:block text-sm text-slate-500 font-medium order-3">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
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

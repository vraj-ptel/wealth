"use client";
import { bulkDeleteTransaction } from "@/actions/accountActions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { categoryColors } from "@/data/category";
import useFetch from "@/hooks/useFetch";
import { TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  RefreshCcw,
  Search,
  Trash,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent } from "../ui/tooltip";

const recurring_intervel: any = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const Transactiontabe = ({ transactions }: { transactions: any }) => {
  const [handleSelectId, sethandleSelectId] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages,setTotalPages]=useState(Math.ceil(transactions.length / 20))
 
  const limit = 20;

  const [sortConfig, setSortConfig] = useState({
    field: "data",
    direction: "desc",
  });
  const router = useRouter();
  const filterdandsortedtransactions = useMemo(() => {
    let result = [...transactions];
    //search items
    if (searchTerm) {
      result = result.filter((trans) => {
        return trans.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      });
    }
    //if recurring
    if (recurringFilter) {
      result = result.filter((trans) => {
        if (recurringFilter === "recurring") {
          return trans.isRecurring;
        } else {
          return !trans.isRecurring;
        }
      });
    }
    //type filter
    if (typeFilter) {
      result = result.filter((trans) => {
        return trans.type === typeFilter;
      });
    }

    //sort
    result.sort((a, b) => {
      let comparision = 0;
      switch (sortConfig.field) {
        case "date":
          comparision = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparision = a.amount - b.amount;
          break;
        case "category":
          comparision = a.category.localeCompare(b.category);
          break;
        default:
          comparision = 0;
      }
      // console.log('comparition',comparision);
      return sortConfig.direction === "asc" ? comparision : -comparision;
    });

    setTotalPages(Math.ceil(result.length / limit))
    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  //sorting for fields
  const handleSort = (sortType: string) => {
    console.log("sort");
    setSortConfig((prev) => ({
      field: sortType,
      direction:
        prev.field === sortType && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id: string) => {
    sethandleSelectId((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const handleSelectAll = () => {
    sethandleSelectId((prev) =>
      prev.length === filterdandsortedtransactions.length
        ? []
        : filterdandsortedtransactions.map((i: any) => i.id)
    );
  };
  //bulk deleteee
  const [data, loading, error, fetchData] = useFetch(bulkDeleteTransaction);
  useEffect(() => {
    if (data && !loading) {
      toast.success("transactions deleted successfully");
    }
  }, [data, loading]);
  useEffect(() => {
    // toast.error((error as { message: string }).message ||"something went wrong" );
    if (error) {
      toast.error("something went wrong");
    }
  }, [error]);
  const handleBulkDelete = async () => {
    if (!window.confirm("are you sure you want to delete these transactions?"))
      return;

    const a = await fetchData(handleSelectId);
  };
  //clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setRecurringFilter("");
    setTypeFilter("");
    sethandleSelectId([]);
  };
  //delete transaction
  const handleDelete = (transactionsId: string) => {
    if (!window.confirm("are you sure you want to delete this transaction?"))
      return;
    fetchData([transactionsId]);
  };
  return (
    <div className="space-y-4">
      {/* filterss */}

      {loading && <BarLoader width={"100%"} className="h-4 " />}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[130px] text-black">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={recurringFilter}
            onValueChange={(value) => {
              setRecurringFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Bulk Actions */}
          {handleSelectId.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Selected ({handleSelectId.length})
              </Button>
            </div>
          )}

          {(searchTerm || typeFilter || recurringFilter) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              title="Clear filters"
            >
              <X className="h-4 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* transactionss  */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  onCheckedChange={handleSelectAll}
                  checked={
                    handleSelectId.length ===
                      filterdandsortedtransactions.length &&
                    filterdandsortedtransactions.length > 0
                  }
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  {" "}
                  Date
                  {sortConfig.field === "date" &&
                  sortConfig.direction === "asc" ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  )}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  {" "}
                  category
                  {sortConfig.field === "category" &&
                  sortConfig.direction === "asc" ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center">
                  amount
                  {sortConfig.field === "amount" &&
                  sortConfig.direction === "asc" ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  )}
                </div>
              </TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filterdandsortedtransactions.length == 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No Transactions Found
                </TableCell>
              </TableRow>
            ) : (
              filterdandsortedtransactions
                .slice(limit * (currentPage - 1), 20 * currentPage)
                .map((trans: any) => {
                  return (
                    <TableRow key={trans.id}>
                      <TableCell className="w-[50px]">
                        <Checkbox
                          onCheckedChange={(e) => handleSelect(trans.id)}
                          checked={handleSelectId.includes(trans.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {format(new Date(trans.date), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{trans.description}</TableCell>
                      <TableCell className="capitalize">
                        <span
                          className="rounded-md px-2 py-1 text-white"
                          style={{
                            backgroundColor: `${
                              categoryColors[trans.category]
                            }`,
                          }}
                        >
                          {trans.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        {trans.type === "EXPENSE" ? (
                          <span className="text-red-500">
                            -{trans.amount.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-green-500">
                            -{trans.amount.toFixed(2)}
                          </span>
                        )}
                        {}
                      </TableCell>
                      <TableCell>{trans.recurring}</TableCell>
                      <TableCell >
                        {trans.isRecurring ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge>
                                  <RefreshCcw className="h-3 w-3" />
                                  {recurring_intervel[trans.recurringInterval]}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div>
                                  <p className="font-medium">
                                    next transaction
                                  </p>
                                  <p className="text-xs text-white">
                                    {format(
                                      trans.nextRecurringDate,
                                      "dd/MM/yyyy HH:mm"
                                    )}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Badge variant={"outline"}>One time</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {/* <DropdownMenuLabel
                              onClick={() =>
                                router.push(
                                  `/transaction/create/?edit=${trans.id}`
                                )
                              }
                            >
                              Edit
                            </DropdownMenuLabel> */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(trans.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
            {/* {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))} */}
          </TableBody>
        </Table>
        {/* for pagination  */}
        <div className="w-full flex justify-center gap-4 mt-3">
          <Button
            variant={"outline"}
            disabled={currentPage == 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            prev
          </Button>
          <span>
            {currentPage}of{totalPages}
          </span>
          <Button
            variant={"outline"}
            disabled={currentPage == totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Transactiontabe;

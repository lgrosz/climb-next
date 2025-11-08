"use client";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuCheckboxItem } from "./ui/dropdown-menu";
import { MoreHorizontal, Trash2Icon } from "lucide-react";
import { Button } from "./ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { deleteAscents } from "@/ascents/actions";
import { useCallback, useState } from "react";

type PartyMember = {
  firstName: string;
  lastName: string;
};

type Party = {
  complete: boolean;
  members: PartyMember[];
};

type Ascent = {
  id: string;
  ascentWindow?: string;
  firstAscent: boolean;
  verified: boolean;
  party: Party;
};

type AscentChanges = {
  verified?: boolean,
  firstAscent?: boolean,
};

export type UpdateAscentAction = (id: string, changes: AscentChanges) => void | Promise<void>;

type AscentTableProps = {
  className?: string;
  selected?: Set<string>;
  toggleSelectAction?: (_: string) => void
  updateAscentAction?: UpdateAscentAction;
  ascents: Ascent[];
};

export function AscentTable({ className, selected, toggleSelectAction, updateAscentAction, ...props }: AscentTableProps) {
  const [ascents, setAscents] = useState(props.ascents);

  const setVerified = useCallback((verified: boolean, id: string) => {
    setAscents(prev =>
      prev.map(a => a.id === id ? { ...a, verified } : a)
    );
    updateAscentAction?.(id, { verified })
  }, [updateAscentAction, setAscents]);

  const setFirstAscent = useCallback((firstAscent: boolean, id: string) => {
    setAscents(prev =>
      prev.map(a => a.id === id ? { ...a, firstAscent } : a)
    );
    updateAscentAction?.(id, { firstAscent })
  }, [updateAscentAction, setAscents]);

  return (
    <Table className={className} border={1}>
      <TableCaption>Notable ascents</TableCaption>
      <TableHeader>
        <TableRow>
          { !!selected && <TableHead /> }
          <TableHead>Party</TableHead>
          <TableHead>Date Window</TableHead>
          <TableHead>First Ascent</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {ascents.map((ascent, i) => (
          <TableRow key={i}>
            { !!selected &&
              <TableCell>
                <input
                  type="checkbox"
                  checked={selected?.has(ascent.id) ?? false}
                  disabled={!toggleSelectAction}
                  onChange={() => toggleSelectAction?.(ascent.id)}
                />
              </TableCell>
            }
            <TableCell>
              {ascent.party.members.length > 0 ? (
                <span>
                  {ascent.party.members
                    .map((m) => `${m.firstName} ${m.lastName}`)
                    .join(", ")}
                  {!ascent.party.complete && "*"}
                </span>
            ) : (
              <em>None</em>
            )}
            </TableCell>
            <TableCell>
              {ascent.ascentWindow}
              {!ascent.verified && <sup>†</sup>}
            </TableCell>
            <TableCell>{ascent.firstAscent ? "Yes" : "No"}</TableCell>
            <TableCell>
              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Properties</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuCheckboxItem
                        checked={ascent.verified}
                        onCheckedChange={checked => setVerified(checked, ascent.id)}
                      >
                        Verified
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={ascent.firstAscent}
                        onCheckedChange={checked => setFirstAscent(checked, ascent.id)}
                      >
                        First ascent
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuGroup>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem>Change party members</DropdownMenuItem>
                      <DropdownMenuItem>Change date window</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem variant="destructive">
                          <Trash2Icon />
                          Trash
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteAscents([ascent.id])}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};


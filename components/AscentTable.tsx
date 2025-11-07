import { FragmentType, getFragmentData, graphql } from "@/gql";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "./ui/dropdown-menu";
import { MoreHorizontal, Trash2Icon } from "lucide-react";
import { Button } from "./ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { deleteAscents } from "@/ascents/actions";

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

type AscentTableProps = {
  className?: string;
  selected?: Set<string>;
  toggleSelect?: (_: string) => void
  ascents: Ascent[];
};

const AscentFragmentType = graphql(`
  fragment AscentTableDataFragment on Ascent {
    id
    ascentWindow
    firstAscent
    verified
    party {
      complete
      members {
	firstName lastName
      }
    }
  }
`);

export function fragmentAsAscentTableProp(frag: Array<FragmentType<typeof AscentFragmentType>>): Ascent[] {
  const a = getFragmentData(AscentFragmentType, frag);

  return a.map(d => ({
    id: d.id,
    ascentWindow: d.ascentWindow || undefined,
    firstAscent: d.firstAscent,
    verified: d.verified,
    party: {
      complete: d.party.complete,
      members: d.party.members.map(m => ({
        firstName: m.firstName ?? "",
        lastName: m.lastName ?? "",
      })),
    }
  }));
}

export function AscentTable({ className, selected, ascents, toggleSelect }: AscentTableProps) {
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
                  disabled={!toggleSelect}
                  onChange={() => toggleSelect?.(ascent.id)}
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
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem>Change party members</DropdownMenuItem>
                      <DropdownMenuItem>Change date window</DropdownMenuItem>
                      <DropdownMenuItem>Toggle verified</DropdownMenuItem>
                      <DropdownMenuItem>Toggle first ascent</DropdownMenuItem>
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


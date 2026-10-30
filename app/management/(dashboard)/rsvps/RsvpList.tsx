"use client";

import { Download, MoreHorizontal, Search, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RsvpRow } from "../../../lib/rsvp";
import { deleteRsvp } from "../../actions";

type Filter = "all" | "yes" | "no";

function formatDate(at: string) {
  return new Date(at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function downloadCsv(rsvps: RsvpRow[]) {
  const cell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const lines = [
    ["Name", "Response", "Guests", "Message", "Replied"].map(cell).join(","),
    ...rsvps.map((rsvp) =>
      [rsvp.name, rsvp.attending ? "Attending" : "Declined", rsvp.guests, rsvp.message, formatDate(rsvp.created_at)]
        .map(cell)
        .join(","),
    ),
  ];
  // The byte-order mark makes Excel read names with accents correctly.
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "rsvps.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function Response({ attending }: { attending: boolean }) {
  return attending ? <Badge>Attending</Badge> : <Badge variant="secondary">Declined</Badge>;
}

/** Who replied, with search, a filter, export, and delete. */
export function RsvpList({ rsvps }: { rsvps: RsvpRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [deleting, startDeleting] = useTransition();

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rsvps.filter(
      (rsvp) =>
        (filter === "all" || rsvp.attending === (filter === "yes")) &&
        (!q || rsvp.name.toLowerCase().includes(q) || rsvp.message.toLowerCase().includes(q)),
    );
  }, [rsvps, query, filter]);

  function remove(rsvp: RsvpRow) {
    if (!window.confirm(`Delete the reply from ${rsvp.name}? This can’t be undone.`)) return;
    startDeleting(async () => {
      const result = await deleteRsvp(rsvp.id);
      if (!result.ok) window.alert("Couldn’t delete that reply. Please try again.");
    });
  }

  function actions(rsvp: RsvpRow) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" disabled={deleting}
            aria-label={`Actions for ${rsvp.name}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive" onSelect={() => remove(rsvp)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="yes">Attending</TabsTrigger>
            <TabsTrigger value="no">Declined</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" placeholder="Search names or notes" aria-label="Search"
            value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
        </div>
        <Button variant="outline" onClick={() => downloadCsv(shown)} disabled={shown.length === 0}>
          <Download />
          Export CSV
        </Button>
      </div>

      {shown.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {rsvps.length === 0 ? "No replies yet. They’ll appear here as guests RSVP." : "No replies match."}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Phones: one card per reply. */}
          <ul className="grid gap-3 md:hidden">
            {shown.map((rsvp) => (
              <li key={rsvp.id}>
                <Card className="gap-2 py-4">
                  <CardContent className="grid gap-2 px-4">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{rsvp.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(rsvp.created_at)}</p>
                      </div>
                      {actions(rsvp)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Response attending={rsvp.attending} />
                      {rsvp.attending && (
                        <span className="text-muted-foreground">
                          {rsvp.guests} {rsvp.guests === 1 ? "guest" : "guests"}
                        </span>
                      )}
                    </div>
                    {rsvp.message && <p className="text-sm whitespace-pre-line">{rsvp.message}</p>}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          {/* Larger screens: a table. */}
          <Card className="hidden py-0 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Name</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead className="text-right">Guests</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Replied</TableHead>
                  <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.map((rsvp) => (
                  <TableRow key={rsvp.id}>
                    <TableCell className="pl-4 font-medium">{rsvp.name}</TableCell>
                    <TableCell><Response attending={rsvp.attending} /></TableCell>
                    <TableCell className="text-right tabular-nums">{rsvp.attending ? rsvp.guests : "–"}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground" title={rsvp.message}>
                      {rsvp.message || "–"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(rsvp.created_at)}</TableCell>
                    <TableCell>{actions(rsvp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}

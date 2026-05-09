"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmInline } from "@/components/ui/ConfirmInline";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import {
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

export default function DevPreview() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectValue, setSelectValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");

  return (
    <div className="min-h-screen bg-clinic-bg">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-8">
        <div className="max-w-6xl">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Component Preview
          </h1>
          <p className="text-slate-600">
            Visual testing for all design system components at all breakpoints
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-8 md:px-8">
        <div className="max-w-6xl space-y-12">
          {/* Page Header */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Page Header</h2>
            <PageHeader
              title="Dashboard"
              description="Welcome to your clinic dashboard"
              action={<Button>Create New</Button>}
            />
          </section>

          {/* Buttons */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Buttons</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="primary" className="w-full">
                    Primary
                  </Button>
                  <Button variant="secondary" className="w-full">
                    Secondary
                  </Button>
                  <Button variant="ghost" className="w-full">
                    Ghost
                  </Button>
                  <Button variant="danger" className="w-full">
                    Danger
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Sizes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button size="sm" className="w-full">
                    Small
                  </Button>
                  <Button size="md" className="w-full">
                    Medium
                  </Button>
                  <Button size="lg" className="w-full">
                    Large (Touch)
                  </Button>
                  <Button isLoading className="w-full">
                    Loading
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Inputs */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Form Fields</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Input</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Email Address"
                    placeholder="user@example.com"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Input
                    label="Error State"
                    error="This field is required"
                    placeholder="Type something..."
                  />
                  <Input
                    label="Helper Text"
                    helperText="This is helper text"
                    placeholder="With helper text..."
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Textarea</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    label="Notes"
                    placeholder="Add your notes here..."
                    value={textareaValue}
                    onChange={(e) => setTextareaValue(e.target.value)}
                  />
                  <Textarea
                    label="Error State"
                    error="Maximum 200 characters"
                    placeholder="Type something..."
                  />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Select */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Select</h2>
            <Card>
              <CardContent className="pt-6">
                <Select value={selectValue} onValueChange={setSelectValue}>
                  <SelectTrigger />
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </section>

          {/* Cards */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Cards</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    This is a card with content inside.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" size="sm">
                    Action
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Card with Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    Cards organize content and actions about a single subject.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Badges */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Badges</h2>
            <Card>
              <CardContent className="flex flex-wrap gap-3 pt-6">
                <Badge variant="default">Default</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="walk-in">Walk-in</Badge>
                <Badge variant="scheduled">Scheduled</Badge>
                <Badge variant="completed">Completed</Badge>
                <Badge variant="default" size="sm">
                  Small
                </Badge>
              </CardContent>
            </Card>
          </section>

          {/* Skeleton */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Skeleton</h2>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Empty State */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Empty State</h2>
            <EmptyState
              icon={<QuestionMarkCircleIcon className="h-12 w-12" />}
              title="No Data Available"
              description="There are no items to display yet."
              action={<Button size="sm">Create New</Button>}
            />
          </section>

          {/* Sheet */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Sheet</h2>
            <Card>
              <CardContent className="pt-6">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="primary">Open Sheet</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Sheet Title</SheetTitle>
                      <SheetDescription>
                        This is a responsive sheet component. It appears as a
                        bottom sheet on mobile and a centered modal on desktop.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 py-4">
                      <Input
                        label="Field Label"
                        placeholder="Enter something..."
                      />
                      <Textarea
                        label="Notes"
                        placeholder="Add notes..."
                      />
                    </div>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button variant="secondary" size="sm">
                          Cancel
                        </Button>
                      </SheetClose>
                      <Button variant="primary" size="sm">
                        Submit
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </CardContent>
            </Card>
          </section>

          {/* Confirm Inline */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Confirm Inline
            </h2>
            <Card>
              <CardContent className="pt-6">
                <ConfirmInline
                  trigger={
                    <Button variant="danger" size="sm">
                      Delete Item
                    </Button>
                  }
                  title="Are you sure?"
                  description="This action cannot be undone."
                  confirmText="Delete"
                  cancelText="Cancel"
                  onConfirm={async () => {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                  }}
                />
              </CardContent>
            </Card>
          </section>

          {/* Responsive Grid Example */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Responsive Grid
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>Card {i + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">
                      Responsive grid card
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Spacing reference */}
          <section className="space-y-4 pb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Touch Targets (Min 44px, Touch 52px)
            </h2>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-wrap gap-2">
                  <button className="h-11 w-24 rounded-lg border border-sky-600 bg-sky-100 text-sm">
                    44px (min)
                  </button>
                  <button className="h-touch-lg w-32 rounded-lg border border-sky-600 bg-sky-100 text-sm">
                    52px (touch)
                  </button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

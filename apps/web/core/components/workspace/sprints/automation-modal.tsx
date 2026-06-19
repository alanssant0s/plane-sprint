/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { FormEvent } from "react";
import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { EModalPosition, EModalWidth, Input, ModalCore, TextArea } from "@plane/ui";
import { useWorkspaceSprint } from "@/hooks/store/use-workspace-sprint";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (automationId: string) => void;
};

const toDateTimeLocalValue = (date: Date) => {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

export const SprintAutomationModal = observer(function SprintAutomationModal(props: Props) {
  const { isOpen, onClose, onCreated } = props;
  const { workspaceSlug } = useParams();
  const { createWorkspaceSprintAutomation } = useWorkspaceSprint();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(toDateTimeLocalValue(new Date()));
  const [duration, setDuration] = useState(14);
  const [nameTemplate, setNameTemplate] = useState("Sprint {{number}}");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!workspaceSlug || !name.trim()) return;

    try {
      setIsSubmitting(true);
      const automation = await createWorkspaceSprintAutomation(workspaceSlug.toString(), {
        name: name.trim(),
        description,
        enabled: true,
        start_date: new Date(startDate).toISOString(),
        sprint_duration_days: duration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        name_template: nameTemplate,
        auto_create_next: true,
      });
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Sprint created",
        message: "The sprint group and its active sprints are ready.",
      });
      onCreated?.(automation.id);
      onClose();
      setName("");
      setDescription("");
      setNameTemplate("Sprint {{number}}");
      setStartDate(toDateTimeLocalValue(new Date()));
      setDuration(14);
    } catch (_error) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Could not create sprint",
        message: "Please check the sprint configuration and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={handleClose} position={EModalPosition.TOP} width={EModalWidth.XL}>
      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        <div>
          <h3 className="text-18 font-medium text-primary">Create sprint</h3>
          <p className="mt-1 text-13 text-tertiary">Configure the sprint group, duration, and automatic naming.</p>
        </div>
        <div className="space-y-3">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Sprint name"
            className="w-full text-14"
            required
          />
          <TextArea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description"
            className="min-h-20 w-full resize-none text-14"
          />
          <div className="grid grid-cols-2 gap-3">
            <label htmlFor="workspace-sprint-start-date" className="space-y-1 text-12 text-secondary">
              <span>Start date</span>
              <Input
                id="workspace-sprint-start-date"
                type="datetime-local"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full text-14"
                required
              />
            </label>
            <label htmlFor="workspace-sprint-duration" className="space-y-1 text-12 text-secondary">
              <span>Duration in days</span>
              <Input
                id="workspace-sprint-duration"
                type="number"
                min={1}
                value={duration}
                onChange={(event) => setDuration(Math.max(1, Number(event.target.value)))}
                className="w-full text-14"
                required
              />
            </label>
          </div>
          <label htmlFor="workspace-sprint-name-template" className="space-y-1 text-12 text-secondary">
            <span>Name template</span>
            <Input
              id="workspace-sprint-name-template"
              value={nameTemplate}
              onChange={(event) => setNameTemplate(event.target.value)}
              placeholder="Sprint {{number}}"
              className="w-full text-14"
              required
            />
            <span className="text-11 text-tertiary">
              Use {"{{number}}"}, {"{{start}}"}, or {"{{end}}"}.
            </span>
          </label>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting || !name.trim()}>
            Create sprint
          </Button>
        </div>
      </form>
    </ModalCore>
  );
});

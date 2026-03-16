"use client";

import { cn } from "@/lib/utils";
import type { Role, Identity, Experience, Scenario } from "@/types/role";
import {
  IDENTITY_OPTIONS,
  EXPERIENCE_OPTIONS,
  SCENARIO_OPTIONS,
} from "@/types/role";

interface RoleSelectorProps {
  value: Role;
  onChange: (role: Role) => void;
}

export function RoleSelectorPanel({ value, onChange }: RoleSelectorProps) {
  const updateIdentity = (identity: Identity) => {
    if (identity === "student") {
      onChange({ identity, scenario: value.scenario });
    } else {
      onChange({
        identity,
        experience: value.experience ?? "1-3y",
        scenario: value.scenario,
      });
    }
  };

  const updateExperience = (experience: Experience) => {
    onChange({ ...value, experience });
  };

  const updateScenario = (scenario: Scenario) => {
    onChange({ ...value, scenario });
  };

  return (
    <div className="space-y-3 p-3">
      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-muted-foreground">
          身份
        </legend>
        <div className="flex gap-1.5">
          {IDENTITY_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={value.identity === opt.value}
              onClick={() => updateIdentity(opt.value)}
            />
          ))}
        </div>
      </fieldset>

      {value.identity === "professional" && (
        <fieldset>
          <legend className="mb-1.5 text-xs font-medium text-muted-foreground">
            经验
          </legend>
          <div className="flex gap-1.5">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={value.experience === opt.value}
                onClick={() => updateExperience(opt.value)}
              />
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-muted-foreground">
          目标场景
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {SCENARIO_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              selected={value.scenario === opt.value}
              onClick={() => updateScenario(opt.value)}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-md px-3 py-1.5 text-xs transition-colors",
        selected
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

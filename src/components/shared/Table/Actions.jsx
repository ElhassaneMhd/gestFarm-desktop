import { Button, DropDown } from "@/components/ui";
import { useTable } from "./useTable";
import { useConfirmationModal } from "@/hooks/useConfModal";
import { useMutationState } from "@tanstack/react-query";
import { Ellipsis, SquarePen, Trash } from "lucide-react";

export function Actions({ onUpdate, onDelete, row, actions }) {
  const {
    showForm,
    confirmOptions,
    resourceName,
    rows,
    page,
    onPaginate,
    formOptions,
  } = useTable();
  const { openModal } = useConfirmationModal();
  const variables = useMutationState({
    filters: {
      mutationKey: [`${resourceName.toLocaleLowerCase()}s`],
      status: "pending",
    },
    select: (mutation) => mutation.state.variables,
  })?.[0];

  const defaultActions = {
    edit: {
      text: "Edit",
      icon: <SquarePen size={16} />,
      onClick: () => {
        showForm({
          fields: formOptions.fields,
          defaultValues: { ...formOptions.defaultValues, ...row },
          onSubmit: (data) => onUpdate({ id: row.profile_id, data }),
          isOpen: true,
          submitButtonText: "Save Changes",
          heading: (
            <>
              Update {resourceName} <span className="text-primary">#</span>
              {row.id}
            </>
          ),
          type: "update",
        });
      },
    },
    delete: {
      text: "Delete",
      icon: <Trash size={16} />,
      onClick: () => {
        const onConfirm = () => {
          onDelete(row.profile_id || row.id);
          rows?.length === 1 && onPaginate(page - 1);
        };
        openModal({ ...confirmOptions, onConfirm });
      },
    },
  };

  const getActions = () => {
    if (typeof actions === "function") return actions(defaultActions);
    if (Array.isArray(actions)) return actions;
    if (actions === "defaultActions") return Object.values(defaultActions);
    return [];
  };

  return (
    <DropDown
      toggler={
        <Button shape="icon">
          <Ellipsis size={18} />
        </Button>
      }
      togglerDisabled={(() => {
        if (!variables) return false;
        const id = row.profile_id || row.id;
        if (
          (Array.isArray(variables) && variables.includes(id)) ||
          variables.id === id ||
          variables === id
        )
          return true;
      })()}
    >
      {getActions()
        .filter((action) => !action?.hidden?.(row))
        .map((action) => (
          <DropDown.Option
            key={action.text}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(row);
            }}
          >
            {action.icon}
            {action.text}
          </DropDown.Option>
        ))}
    </DropDown>
  );
}

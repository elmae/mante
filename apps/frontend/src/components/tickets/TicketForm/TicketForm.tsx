import React from "react";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { styles } from "./TicketForm.styles";
import { ITicketFormProps, ITicketFormData } from "./TicketForm.types";
import { TicketPriority, TicketType } from "@/types/entities";
import { useATMs } from "@/hooks/useATMs";
import { useUsers } from "@/hooks/useUsers";

export const TicketForm: React.FC<ITicketFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
}) => {
  const { data: atms, isLoading: isLoadingAtms } = useATMs();
  const { data: users, isLoading: isLoadingUsers } = useUsers();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ITicketFormData>({
    defaultValues: initialData || {
      type: TicketType.CORRECTIVE,
      priority: TicketPriority.MEDIUM,
    },
  });

  const onFormSubmit = (data: ITicketFormData) => {
    onSubmit(data);
  };

  if (isLoadingAtms || isLoadingUsers) {
    return <div className="text-center">Cargando...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>
          Título
        </label>
        <input
          id="title"
          type="text"
          className={styles.input}
          {...register("title", { required: "El título es requerido" })}
        />
        {errors.title && (
          <span className={styles.errorText}>{errors.title.message}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>
          Descripción
        </label>
        <textarea
          id="description"
          className={styles.textArea}
          {...register("description", {
            required: "La descripción es requerida",
          })}
        />
        {errors.description && (
          <span className={styles.errorText}>{errors.description.message}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="type" className={styles.label}>
          Tipo
        </label>
        <select
          id="type"
          className={styles.select}
          {...register("type", { required: "El tipo es requerido" })}
        >
          {Object.values(TicketType).map((type) => (
            <option key={type} value={type}>
              {type === "preventive"
                ? "Preventivo"
                : type === "corrective"
                ? "Correctivo"
                : "Visita"}
            </option>
          ))}
        </select>
        {errors.type && (
          <span className={styles.errorText}>{errors.type.message}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="priority" className={styles.label}>
          Prioridad
        </label>
        <select
          id="priority"
          className={styles.select}
          {...register("priority", { required: "La prioridad es requerida" })}
        >
          {Object.values(TicketPriority).map((priority) => (
            <option key={priority} value={priority}>
              {priority === "low"
                ? "Baja"
                : priority === "medium"
                ? "Media"
                : priority === "high"
                ? "Alta"
                : "Crítica"}
            </option>
          ))}
        </select>
        {errors.priority && (
          <span className={styles.errorText}>{errors.priority.message}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="atm_id" className={styles.label}>
          ATM
        </label>
        <select
          id="atm_id"
          className={styles.select}
          {...register("atm_id", { required: "El ATM es requerido" })}
        >
          <option value="">Seleccionar ATM</option>
          {atms?.map((atm) => (
            <option key={atm.id} value={atm.id}>
              {atm.serial} - {atm.location}
            </option>
          ))}
        </select>
        {errors.atm_id && (
          <span className={styles.errorText}>{errors.atm_id.message}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="assigned_to" className={styles.label}>
          Asignar a
        </label>
        <select
          id="assigned_to"
          className={styles.select}
          {...register("assigned_to")}
        >
          <option value="">Sin asignar</option>
          {users?.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="due_date" className={styles.label}>
          Fecha límite
        </label>
        <Controller
          control={control}
          name="due_date"
          render={({ field }) => (
            <DatePicker
              id="due_date"
              selected={field.value}
              onChange={(date) => field.onChange(date)}
              className={styles.datePicker}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              placeholderText="Seleccionar fecha"
            />
          )}
        />
      </div>

      <div className={styles.buttonGroup}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isLoading}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
};

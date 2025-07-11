import { Input } from "@/components/ui/input";
import { Textarea } from "./textarea";
import { cn } from "@/lib/utils";

interface TextInputProps {
  id: string;
  label: string;
  name: string;
  type?: string;
  error?: string;
  defaultValue?: string;
  textArea?: boolean;
  className?: string;
}

function TextInput({
  id,
  label,
  name,
  type = "text",
  error,
  defaultValue,
  textArea,
  className,
}: TextInputProps) {
  return (
    <div className="input__container">
      {!textArea ? (
        <Input
          type={type}
          placeholder={error || label}
          name={name}
          id={id}
          className={cn(className, `${error ? "text-red-500" : ""}`)}
          defaultValue={defaultValue}
        />
      ) : (
        <Textarea
          placeholder={error || label}
          name={name}
          id={id}
          className={cn(className, `${error ? "text-red-500" : ""}`)}
          defaultValue={defaultValue}
        />
      )}
    </div>
  );
}

export { type TextInputProps, TextInput };

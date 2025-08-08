import { getBackgroundColor } from "@/utils/get-backgrounColor";

interface FooterProps {
  data: {
    backgroundColor: "white" | "black" | "green" | "red";
    copy: string;
  };
}

export function Footer({ data }: FooterProps) {
  if (!data) return null;

  const { backgroundColor, copy } = data;
  return (
    <footer
      className={`section ${getBackgroundColor(
        backgroundColor
      )} justify-center items-center align-middle text-center`}
    >
      <div className="wrapper justify-center items-center align-middle text-center">
        <p className="subtitle text-white">{copy}</p>
      </div>
    </footer>
  );
}

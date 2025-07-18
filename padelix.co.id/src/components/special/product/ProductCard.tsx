import { Card, type CardProps } from "@/components/general/Card";

export const ProductCard = (props: Readonly<CardProps>) => (
  <Card
    {...props}
    className="bg-lime-400 m-2 p-2 rounded-[1.875rem]"
    basePath="product"
  />
);

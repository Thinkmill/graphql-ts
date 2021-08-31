import { SVGAttributes } from "react";

export function Minus(props: SVGAttributes<SVGSVGElement>) {
  return (
    <svg {...props}>
      <use xlinkHref="#minus-icon" />
    </svg>
  );
}

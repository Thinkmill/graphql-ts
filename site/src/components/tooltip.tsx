import { ReactNode } from "react";
import { usePopperTooltip } from "react-popper-tooltip";
import * as styles from "./tooltip.css";

type TriggerProps = {
  ref: (element: HTMLElement | null) => void;
};

type TooltipProps = {
  tooltip: ReactNode;
  children: (args: { triggerProps: TriggerProps }) => ReactNode;
};

export function Tooltip({ tooltip, children }: TooltipProps) {
  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } =
    usePopperTooltip();
  return (
    <span>
      {children({ triggerProps: { ref: setTriggerRef } })}
      {visible && (
        <div
          ref={setTooltipRef}
          {...getTooltipProps({ className: styles.tooltip })}
        >
          {tooltip}
        </div>
      )}
    </span>
  );
}

import { Link } from "react-router-dom";
import { ChevronRight, UserRound } from "lucide-react";
import { getImageUrl } from "../../utils/dashboard";

const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a6f50]/40";

export function StudentDetail({
    label,
    value,
}) {
    const displayValue =
        value !== undefined &&
        value !== null &&
        String(value).trim()
            ? value
            : "—";

    return (
        <div className="rounded-lg border border-[#eee7de] bg-[#fcfaf6] px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#a99d8f]">
                {label}
            </p>

            <p className="mt-0.5 truncate text-xs font-semibold text-[#302820]">
                {displayValue}
            </p>
        </div>
    );
}

export function Avatar({
    user,
    size = 40,
    iconSize = 20,
}) {
    const src = getImageUrl(
        user?.profile_picture
    );

    return (
        <div
            className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f3ebdf] text-[#8a6f50]"
            style={{
                width: size,
                height: size,
            }}
        >
            {src ? (
                <img
                    src={src}
                    alt="Profile"
                    className="h-full w-full object-cover"
                />
            ) : (
                <UserRound
                    size={iconSize}
                />
            )}
        </div>
    );
}

export function Skeleton({
    className = "",
}) {
    return (
        <div
            className={`skeleton-shimmer rounded-lg ${className}`}
        />
    );
}

export function Sparkline({
    values,
    color,
}) {
    const width = 90;
    const height = 34;

    if (
        !values ||
        values.length < 2
    ) {
        return null;
    }

    const max = Math.max(
        ...values,
        1
    );

    const min = Math.min(
        ...values,
        0
    );

    const range =
        max - min || 1;

    const points = values.map(
        (value, index) => {
            const x =
                (index /
                    (values.length - 1)) *
                width;

            const y =
                height -
                ((value - min) /
                    range) *
                    height;

            return [x, y];
        }
    );

    const path = points
        .map(
            ([x, y], index) =>
                `${
                    index === 0
                        ? "M"
                        : "L"
                }${x},${y}`
        )
        .join(" ");

    const [lastX, lastY] =
        points[points.length - 1];

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="shrink-0"
            aria-hidden="true"
        >
            <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <circle
                cx={lastX}
                cy={lastY}
                r="2.5"
                fill={color}
            />
        </svg>
    );
}

export function LineAreaChart({
    data,
    color,
}) {
    const width = 560;
    const height = 200;
    const padding = 24;

    const values = data.map(
        (item) => item.value
    );

    const max = Math.max(
        ...values,
        4
    );

    const ceiling = max * 1.15;

    const points = data.map(
        (item, index) => {
            const x =
                padding +
                (index /
                    (data.length - 1)) *
                    (width -
                        padding * 2);

            const y =
                height -
                padding -
                (item.value /
                    ceiling) *
                    (height -
                        padding * 2);

            return {
                x,
                y,
                ...item,
            };
        }
    );

    const linePath = points
        .map(
            (point, index) =>
                `${
                    index === 0
                        ? "M"
                        : "L"
                }${point.x},${point.y}`
        )
        .join(" ");

    const areaPath = `${linePath} L${
        points[points.length - 1]
            .x
    },${
        height - padding
    } L${points[0].x},${
        height - padding
    } Z`;

    const gridLines = [
        0.25,
        0.5,
        0.75,
        1,
    ];

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible"
            role="img"
            aria-label="Clinic visits per month"
        >
            <defs>
                <linearGradient
                    id="visitsFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <stop
                        offset="0%"
                        stopColor={color}
                        stopOpacity="0.25"
                    />

                    <stop
                        offset="100%"
                        stopColor={color}
                        stopOpacity="0"
                    />
                </linearGradient>
            </defs>

            {gridLines.map(
                (gridLine) => {
                    const y =
                        height -
                        padding -
                        gridLine *
                            (height -
                                padding *
                                    2);

                    return (
                        <line
                            key={
                                gridLine
                            }
                            x1={
                                padding
                            }
                            x2={
                                width -
                                padding
                            }
                            y1={y}
                            y2={y}
                            stroke="#eee7de"
                            strokeWidth="1"
                        />
                    );
                }
            )}

            <path
                d={areaPath}
                fill="url(#visitsFill)"
                stroke="none"
            />

            <path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {points.map(
                (point, index) => (
                    <g
                        key={index}
                    >
                        <circle
                            cx={
                                point.x
                            }
                            cy={
                                point.y
                            }
                            r={
                                index ===
                                points.length -
                                    1
                                    ? 4
                                    : 3
                            }
                            fill={
                                color
                            }
                        />

                        {point.value >
                            0 && (
                            <text
                                x={
                                    point.x
                                }
                                y={
                                    point.y -
                                    9
                                }
                                textAnchor="middle"
                                fontSize="10"
                                fontWeight="700"
                                fill={
                                    color
                                }
                            >
                                {
                                    point.value
                                }
                            </text>
                        )}
                    </g>
                )
            )}

            {points.map(
                (
                    point,
                    index
                ) => (
                    <text
                        key={`label-${index}`}
                        x={point.x}
                        y={
                            height -
                            4
                        }
                        textAnchor="middle"
                        fontSize="10"
                        fill="#887d70"
                        fontWeight="500"
                    >
                        {
                            point.label
                        }
                    </text>
                )
            )}
        </svg>
    );
}

export function DonutChart({
    data,
    total,
    centerLabel,
    centerValue,
}) {
    const size = 140;
    const strokeWidth = 20;
    const radius =
        (size -
            strokeWidth) /
        2;

    const circumference =
        2 * Math.PI * radius;

    let cumulative = 0;

    return (
        <div
            className="relative shrink-0"
            style={{
                width: size,
                height: size,
            }}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="-rotate-90"
                aria-hidden="true"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#eee7de"
                    strokeWidth={
                        strokeWidth
                    }
                />

                {data.map(
                    (item) => {
                        const fraction =
                            item.value /
                            total;

                        const dash =
                            fraction *
                            circumference;

                        const offset =
                            cumulative *
                            circumference;

                        cumulative +=
                            fraction;

                        return (
                            <circle
                                key={
                                    item.label
                                }
                                cx={
                                    size /
                                    2
                                }
                                cy={
                                    size /
                                    2
                                }
                                r={
                                    radius
                                }
                                fill="none"
                                stroke={
                                    item.color
                                }
                                strokeWidth={
                                    strokeWidth
                                }
                                strokeDasharray={`${dash} ${
                                    circumference -
                                    dash
                                }`}
                                strokeDashoffset={
                                    -offset
                                }
                            />
                        );
                    }
                )}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold text-[#302820]">
                    {centerValue}
                </span>

                <span className="text-[10px] text-[#a99d8f]">
                    {centerLabel}
                </span>
            </div>
        </div>
    );
}

export function SectionHeader({
    icon,
    title,
    subtitle,
    link,
    linkLabel = "View all",
}: { icon: React.ComponentType<{ size?: number }>; title: string; subtitle: string; link?: string; linkLabel?: string }) {
    const Icon = icon;

    return (
        <div className="mb-5 flex items-start justify-between gap-3">

            <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3ebdf] text-[#8a6f50]">
                    <Icon size={18} />
                </div>

                <div>
                    <h2 className="text-[17px] font-bold">
                        {title}
                    </h2>

                    <p className="mt-0.5 text-xs text-[#887d70]">
                        {subtitle}
                    </p>
                </div>
            </div>

            {link && (
                <Link
                    to={link}
                    className="flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#8a6f50] hover:underline"
                >
                    {linkLabel}

                    <ChevronRight
                        size={14}
                    />
                </Link>
            )}
        </div>
    );
}

export function QuickAction({
    to,
    icon,
    title,
    description,
    primary = false,
}: { to: string; icon: React.ComponentType<{ size?: number }>; title: string; description: string; primary?: boolean }) {
    const Icon = icon;

    return (
        <Link
            to={to}
            className={`group flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${FOCUS_RING} ${
                primary
                    ? "border-[#8a6f50] bg-[#8a6f50] text-white hover:bg-[#735a40]"
                    : "border-[#eee7de] bg-[#fcfaf6] hover:border-[#c9b08d] hover:bg-[#f6eee4]"
            }`}
        >
            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    primary
                        ? "bg-white/15 text-white"
                        : "bg-[#f3ebdf] text-[#8a6f50] group-hover:bg-[#8a6f50] group-hover:text-white"
                }`}
            >
                <Icon size={19} />
            </div>

            <div className="min-w-0 flex-1">
                <p
                    className={`text-sm font-semibold ${
                        primary
                            ? "text-white"
                            : "text-[#302820]"
                    }`}
                >
                    {title}
                </p>

                <p
                    className={`truncate text-xs ${
                        primary
                            ? "text-white/75"
                            : "text-[#887d70]"
                    }`}
                >
                    {description}
                </p>
            </div>

            <ChevronRight
                size={16}
                className={`shrink-0 ${
                    primary
                        ? "text-white/70"
                        : "text-[#ded4c9]"
                }`}
            />
        </Link>
    );
}


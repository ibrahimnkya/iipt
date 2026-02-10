"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
    title: string;
    description?: string;
}

interface StepperProps {
    steps: Step[];
    currentStep: number;
    className?: string;
    orientation?: "horizontal" | "vertical";
}

export function Stepper({
    steps,
    currentStep,
    className,
    orientation = "horizontal"
}: StepperProps) {
    if (orientation === "vertical") {
        return (
            <div className={cn("flex flex-col gap-8", className)}>
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;

                    return (
                        <div key={index} className="flex gap-4 group">
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2 z-10",
                                        isCompleted
                                            ? "bg-brand-green border-brand-green text-white shadow-lg shadow-green-200"
                                            : isActive
                                                ? "bg-white border-brand-green text-brand-green ring-4 ring-brand-green/10"
                                                : "bg-white border-gray-200 text-gray-400"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-5 h-5 animate-in zoom-in duration-300" />
                                    ) : (
                                        <span className="text-xs font-black">{index + 1}</span>
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            "w-0.5 h-12 -my-1 transition-colors duration-500",
                                            isCompleted ? "bg-brand-green" : "bg-gray-100"
                                        )}
                                    />
                                )}
                            </div>

                            <div className="flex flex-col pt-1">
                                <p
                                    className={cn(
                                        "text-sm font-black uppercase tracking-wider transition-colors duration-300",
                                        isActive || isCompleted ? "text-gray-900" : "text-gray-400"
                                    )}
                                >
                                    {step.title}
                                </p>
                                {step.description && (
                                    <p className={cn(
                                        "text-xs font-medium transition-colors duration-300",
                                        isActive || isCompleted ? "text-gray-500" : "text-gray-400"
                                    )}>
                                        {step.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className={cn("w-full py-4", className)}>
            <div className="flex items-center justify-between relative">
                {/* Line background */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />

                {/* Progress line */}
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-brand-green -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;

                    return (
                        <div key={index} className="relative z-10 flex flex-col items-center group">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                                    isCompleted
                                        ? "bg-brand-green border-brand-green text-white shadow-lg shadow-green-200"
                                        : isActive
                                            ? "bg-white border-brand-green text-brand-green ring-4 ring-brand-green/10"
                                            : "bg-white border-gray-200 text-gray-400"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-6 h-6 animate-in zoom-in duration-300" />
                                ) : (
                                    <span className="text-sm font-black">{index + 1}</span>
                                )}
                            </div>

                            <div className="absolute top-12 whitespace-nowrap text-center">
                                <p
                                    className={cn(
                                        "text-xs font-black uppercase tracking-wider transition-colors duration-300",
                                        isActive || isCompleted ? "text-gray-900" : "text-gray-400"
                                    )}
                                >
                                    {step.title}
                                </p>
                                {step.description && (
                                    <p className="text-[10px] text-gray-400 font-medium hidden md:block">
                                        {step.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

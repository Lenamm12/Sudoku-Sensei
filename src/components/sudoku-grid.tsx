'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { CheckSudokuGridOutput } from '@/ai/flows/error-check';
import type { GetSudokuHintOutput } from '@/ai/flows/ai-hint';

type SudokuGridProps = {
  grid: number[][];
  initialGrid: number[][];
  errors: CheckSudokuGridOutput['errors'];
  hint: GetSudokuHintOutput | null;
  selectedCell: { row: number, col: number } | null;
  selectedValue: number | null;
  onCellChange: (row: number, col: number, value: number) => void;
  onCellSelect: (cell: { row: number, col: number } | null) => void;
};

export function SudokuGrid({
  grid,
  initialGrid,
  errors,
  hint,
  selectedCell,
  selectedValue,
  onCellChange,
  onCellSelect
}: SudokuGridProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, row: number, col: number) => {
    const value = e.target.value;
    if (/^[1-9]$/.test(value)) {
      onCellChange(row, col, parseInt(value, 10));
    } else if (value === '') {
      onCellChange(row, col, 0);
    }
  };

  return (
    <div className="grid grid-cols-9 aspect-square bg-card border-2 border-foreground rounded-lg shadow-lg overflow-hidden">
      {grid.map((rowValues, rowIndex) =>
        rowValues.map((cellValue, colIndex) => {
          const isInitial = initialGrid[rowIndex][colIndex] !== 0;
          const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
          const isHighlighted = !isSelected && selectedCell && (
            selectedCell.row === rowIndex ||
            selectedCell.col === colIndex ||
            (Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3) && Math.floor(selectedCell.col / 3) === Math.floor(colIndex / 3))
          );
          const isSameValue = selectedValue !== 0 && selectedValue !== null && cellValue === selectedValue;
          const isError = errors.some(err => err.row === rowIndex && err.col === colIndex);
          const isHint = hint?.row === rowIndex && hint?.col === colIndex;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                'flex items-center justify-center border-border border',
                (colIndex === 2 || colIndex === 5) && 'border-r-foreground/50 border-r-2',
                (rowIndex === 2 || rowIndex === 5) && 'border-b-foreground/50 border-b-2',
                colIndex === 0 && 'border-l-0',
                colIndex === 8 && 'border-r-0',
                rowIndex === 0 && 'border-t-0',
                rowIndex === 8 && 'border-b-0'
              )}
            >
              <input
                type="tel"
                maxLength={1}
                pattern="[1-9]"
                value={cellValue === 0 ? '' : cellValue}
                onChange={(e) => handleInputChange(e, rowIndex, colIndex)}
                onFocus={() => onCellSelect({ row: rowIndex, col: colIndex })}
                readOnly={isInitial}
                aria-label={`Sudoku cell row ${rowIndex + 1} column ${colIndex + 1}`}
                className={cn(
                  'w-full h-full text-center text-2xl md:text-3xl font-bold bg-transparent outline-none transition-colors duration-200',
                  'focus:bg-primary/20',
                  isInitial ? 'text-foreground font-semibold' : 'text-foreground/80',
                  isError && 'bg-destructive/30 text-destructive-foreground',
                  isHint && 'bg-accent/50 animate-pulse',
                  isSelected && 'bg-primary/30 relative z-10',
                  isHighlighted && 'bg-muted',
                  isSameValue && !isSelected && 'bg-primary/20 text-primary-foreground',
                )}
              />
            </div>
          );
        })
      )}
    </div>
  );
}

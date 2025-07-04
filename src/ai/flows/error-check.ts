'use server';

/**
 * @fileOverview Checks a Sudoku grid for errors.
 *
 * - checkSudokuGrid - A function that checks the Sudoku grid for errors.
 * - CheckSudokuGridInput - The input type for the checkSudokuGrid function.
 * - CheckSudokuGridOutput - The return type for the checkSudokuGrid function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckSudokuGridInputSchema = z.array(z.array(z.number().min(0).max(9))).length(9).describe('A 9x9 Sudoku grid represented as a 2D array of numbers. Use 0 to represent empty cells.');
export type CheckSudokuGridInput = z.infer<typeof CheckSudokuGridInputSchema>;

const CheckSudokuGridOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the Sudoku grid is valid according to Sudoku rules.'),
  errors: z.array(z.object({
    row: z.number().min(0).max(8).describe('The row index of the error (0-indexed).'),
    col: z.number().min(0).max(8).describe('The column index of the error (0-indexed).'),
    value: z.number().min(1).max(9).describe('The conflicting value.'),
    reason: z.string().describe('Explanation of why there is a conflict at the specified row and column'),
  })).describe('An array of errors found in the Sudoku grid. Empty if the grid is valid.'),
});
export type CheckSudokuGridOutput = z.infer<typeof CheckSudokuGridOutputSchema>;

export async function checkSudokuGrid(input: CheckSudokuGridInput): Promise<CheckSudokuGridOutput> {
  return checkSudokuGridFlow(input);
}

const checkSudokuGridPrompt = ai.definePrompt({
  name: 'checkSudokuGridPrompt',
  input: {schema: CheckSudokuGridInputSchema},
  output: {schema: CheckSudokuGridOutputSchema},
  prompt: `You are an expert Sudoku validator.  You will receive a Sudoku grid as a 2D array of numbers.  Empty cells are represented by 0.

You must determine if the grid is valid according to Sudoku rules.  Sudoku rules are as follows:

1. Each row must contain the digits 1-9 without repetition.
2. Each column must contain the digits 1-9 without repetition.
3. Each of the nine 3x3 subgrids of the grid must contain the digits 1-9 without repetition.

If the grid is valid, return isValid: true and an empty errors array.

If the grid is invalid, return isValid: false and an errors array. Each error should contain the row, col, value, and reason for the conflict.

Here is the Sudoku grid:

{{#each this}}
  {{this}}
{{/each}}
`,
});

const checkSudokuGridFlow = ai.defineFlow(
  {
    name: 'checkSudokuGridFlow',
    inputSchema: CheckSudokuGridInputSchema,
    outputSchema: CheckSudokuGridOutputSchema,
  },
  async input => {
    const {output} = await checkSudokuGridPrompt(input);
    return output!;
  }
);

'use server';

/**
 * @fileOverview Converts an image of a Sudoku puzzle to a grid.
 *
 * - imageToGrid - A function that handles the image to grid conversion process.
 * - ImageToGridInput - The input type for the imageToGrid function.
 * - ImageToGridOutput - The return type for the imageToGrid function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageToGridInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of a Sudoku puzzle, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type ImageToGridInput = z.infer<typeof ImageToGridInputSchema>;

const ImageToGridOutputSchema = z.object({
  grid: z
    .array(z.array(z.number()))
    .describe('A 9x9 array representing the Sudoku grid. Use 0 for empty cells.'),
});
export type ImageToGridOutput = z.infer<typeof ImageToGridOutputSchema>;

export async function imageToGrid(input: ImageToGridInput): Promise<ImageToGridOutput> {
  return imageToGridFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageToGridPrompt',
  input: {schema: ImageToGridInputSchema},
  output: {schema: ImageToGridOutputSchema},
  prompt: `You are an AI expert at extracting Sudoku grids from images.

You will be provided an image of a Sudoku puzzle. Extract the Sudoku grid from the image and represent it as a 9x9 array of numbers. Use 0 for empty cells.

Image: {{media url=photoDataUri}}

Respond ONLY with a valid JSON string representing the grid. Do not include any explanation or other text. The grid must follow this schema:
${JSON.stringify(ImageToGridOutputSchema.shape)}`,
});

const imageToGridFlow = ai.defineFlow(
  {
    name: 'imageToGridFlow',
    inputSchema: ImageToGridInputSchema,
    outputSchema: ImageToGridOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

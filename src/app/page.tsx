'use client';

import * as React from 'react';
import { imageToGrid } from '@/ai/flows/image-to-grid';
import { checkSudokuGrid, type CheckSudokuGridOutput } from '@/ai/flows/error-check';
import { getSudokuHint, type GetSudokuHintOutput, type GetSudokuHintInput } from '@/ai/flows/ai-hint';

import { SudokuGrid } from '@/components/sudoku-grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ScanLine, CheckCircle2, Lightbulb, Eraser, Save, Upload, Loader2, BrainCircuit } from 'lucide-react';
import type { Difficulty } from '@/lib/types';

const initialEmptyGrid = Array(9).fill(null).map(() => Array(9).fill(0));
const SUDOKU_SAVE_KEY = 'sudoku-sensei-save';

export default function Home() {
  const [grid, setGrid] = React.useState<number[][]>(initialEmptyGrid);
  const [initialGrid, setInitialGrid] = React.useState<number[][]>(initialEmptyGrid);
  const [selectedCell, setSelectedCell] = React.useState<{ row: number; col: number } | null>(null);
  const [errors, setErrors] = React.useState<CheckSudokuGridOutput['errors']>([]);
  const [hint, setHint] = React.useState<GetSudokuHintOutput | null>(null);
  const [difficulty, setDifficulty] = React.useState<Difficulty>('medium');
  const [loadingState, setLoadingState] = React.useState({ scan: false, check: false, hint: false });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleCellChange = (row: number, col: number, value: number) => {
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = value;
    setGrid(newGrid);
    if (errors.length > 0) setErrors([]);
    if (hint) setHint(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleScan(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input to allow re-selection of the same file
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleScan = async (photoDataUri: string) => {
    setLoadingState(prev => ({ ...prev, scan: true }));
    setErrors([]);
    setHint(null);
    try {
      const { grid: newGrid } = await imageToGrid({ photoDataUri });
      setGrid(newGrid);
      setInitialGrid(newGrid);
      toast({ title: "Scan Successful", description: "The Sudoku grid has been loaded." });
    } catch (e) {
      toast({ variant: "destructive", title: "Scan Failed", description: "Could not read the grid from the image. Please try again with a clearer picture." });
    }
    setLoadingState(prev => ({ ...prev, scan: false }));
  };

  const handleCheck = async () => {
    setLoadingState(prev => ({ ...prev, check: true }));
    setErrors([]);
    setHint(null);
    try {
      const { isValid, errors: foundErrors } = await checkSudokuGrid(grid);
      if (isValid) {
        toast({ title: "Grid is Valid!", description: "No errors found. Keep going!" });
      } else {
        setErrors(foundErrors);
        toast({ variant: "destructive", title: "Errors Found", description: `Found ${foundErrors.length} error(s) on the board.` });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Check Failed", description: "An unexpected error occurred while checking the grid." });
    }
    setLoadingState(prev => ({ ...prev, check: false }));
  };
  
  const handleHint = async () => {
    setLoadingState(prev => ({ ...prev, hint: true }));
    setErrors([]);
    setHint(null);
    try {
      const hintInput: GetSudokuHintInput = { grid, difficulty };
      const newHint = await getSudokuHint(hintInput);
      setHint(newHint);
      toast({ title: `Hint for ${difficulty} level`, description: "A suggestion has been highlighted on the board." });
    } catch (e) {
      toast({ variant: "destructive", title: "Hint Failed", description: "Could not generate a hint at this time." });
    }
    setLoadingState(prev => ({ ...prev, hint: false }));
  };

  const handleClear = () => {
    setGrid(initialEmptyGrid);
    setInitialGrid(initialEmptyGrid);
    setErrors([]);
    setHint(null);
    setSelectedCell(null);
    toast({ title: "Board Cleared", description: "Ready for a new puzzle." });
  };

  const handleSave = () => {
    try {
      const saveData = JSON.stringify({ grid, initialGrid });
      localStorage.setItem(SUDOKU_SAVE_KEY, saveData);
      toast({ title: "Game Saved", description: "Your progress has been saved locally." });
    } catch (e) {
      toast({ variant: "destructive", title: "Save Failed", description: "Could not save game to local storage." });
    }
  };

  const handleLoad = () => {
    try {
      const savedData = localStorage.getItem(SUDOKU_SAVE_KEY);
      if (savedData) {
        const { grid: savedGrid, initialGrid: savedInitialGrid } = JSON.parse(savedData);
        setGrid(savedGrid);
        setInitialGrid(savedInitialGrid);
        setErrors([]);
        setHint(null);
        setSelectedCell(null);
        toast({ title: "Game Loaded", description: "Your saved progress has been restored." });
      } else {
        toast({ variant: "destructive", title: "Load Failed", description: "No saved game found." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Load Failed", description: "Could not load saved game." });
    }
  };

  const selectedValue = selectedCell ? grid[selectedCell.row][selectedCell.col] : null;

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="font-headline text-5xl font-bold tracking-tight">Sudoku Sensei</h1>
        <p className="text-muted-foreground mt-2">Your AI-powered Sudoku assistant.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div className="md:col-span-2 lg:col-span-3 flex items-center justify-center">
          <div className="w-full max-w-2xl aspect-square">
            <SudokuGrid
              grid={grid}
              initialGrid={initialGrid}
              errors={errors}
              hint={hint}
              selectedCell={selectedCell}
              selectedValue={selectedValue}
              onCellChange={handleCellChange}
              onCellSelect={setSelectedCell}
            />
          </div>
        </div>

        <div className="md:col-span-1 lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BrainCircuit /> Game Actions</CardTitle>
              <CardDescription>Manage your puzzle</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <Button onClick={() => fileInputRef.current?.click()} disabled={loadingState.scan}>
                {loadingState.scan ? <Loader2 className="animate-spin" /> : <ScanLine />}
                Scan
              </Button>
              <Button variant="outline" onClick={handleClear}><Eraser /> Clear</Button>
              <Button variant="outline" onClick={handleSave}><Save /> Save</Button>
              <Button variant="outline" onClick={handleLoad}><Upload /> Load</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lightbulb /> AI Assistant</CardTitle>
              <CardDescription>Get help from the Sensei</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={handleCheck} disabled={loadingState.check} variant="secondary">
                {loadingState.check ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                Check Grid
              </Button>
              <div className="flex gap-2">
                <Select value={difficulty} onValueChange={(v: Difficulty) => setDifficulty(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleHint} disabled={loadingState.hint} className="flex-shrink-0">
                  {loadingState.hint ? <Loader2 className="animate-spin" /> : <Lightbulb />}
                  Hint
                </Button>
              </div>
            </CardContent>
          </Card>

          {hint && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>AI Hint ({difficulty})</AlertTitle>
              <AlertDescription>
                {hint.reasoning}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </main>
  );
}

; Test assembly file for TrinaryVM CLI
; This file tests both glyph directives and regular instructions

start:
  ; Tetragram glyph directive
  .glyph 𝌆𝌊𝌒𝍏𝌚𝌒𝍆𝌩
  
  ; Data movement instructions
  PUSH #42
  MOV R1, R2
  LOAD R3, [R4]
  
  ; Arithmetic instructions
  ADD R1, R2, R3
  SUB R4, R5, R6
  MUL R7, R8, R9
  
  ; Control flow
  JMP 0x1000
  JEQ R1, R2, 0x2000
  
  ; System instructions
  HALT 
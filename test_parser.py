import re
import json

def parse_user_request(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f]
    
    # Find start of dataset (after 'Last Real Stage')
    start_idx = 0
    for i, line in enumerate(lines):
        if line == 'Last Real Stage':
            start_idx = i + 1
            break
            
    dataset_lines = lines[start_idx:]
    
    # We want to group lines by ID.
    # An ID line is a pure integer (or string representing integer ID like '20', '21', '1000') that marks the start of a record.
    # But wait, some values like grade '8' or year '2026' might be numbers, so an ID starts a record when it matches the ID sequence or is followed by Name, Gender (Male/Female/null), etc.
    
    # Let's inspect how IDs are distributed.
    id_line_indices = []
    for i, line in enumerate(dataset_lines):
        if re.match(r'^\d+$', line):
            # Check if next line is a name (non-number) and line after that is Male/Female/Professionals/etc or date
            val = int(line)
            if 1 <= val <= 2000:
                if i + 1 < len(dataset_lines) and not re.match(r'^\d+$', dataset_lines[i+1]):
                    # Could be an ID!
                    id_line_indices.append((i, val, dataset_lines[i+1]))
                    
    print(f"Found {len(id_line_indices)} potential ID lines.")
    for idx, val, name in id_line_indices[:15]:
        print(f"Index {idx}: ID={val}, Name={name}")

parse_user_request(r'C:\Users\ASUS ROG\.gemini\antigravity\scratch\latest_user_request.txt')

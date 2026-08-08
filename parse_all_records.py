import re
import json

def parse_all():
    with open(r'C:\Users\ASUS ROG\.gemini\antigravity\scratch\latest_user_request.txt', 'r', encoding='utf-8') as f:
        text = f.read()

    # Find where dataset starts
    start_pos = text.find('Last Real Stage\n')
    if start_pos != -1:
        data_text = text[start_pos + len('Last Real Stage\n'):]
    else:
        data_text = text

    lines = [line.strip() for line in data_text.split('\n') if line.strip()]
    
    # We want to identify record boundaries. A record starts with an ID line.
    # An ID line is a line containing a number that starts a new record.
    # Let's see: how to know if a number line is a new record ID?
    # A new record ID is a number line followed by a Name line (which is not a number, not Male/Female, not a date, not a class, etc.).
    
    genders = {'Male', 'Female'}
    memberships = {'Active', 'Active (Grace Period)', 'Expired'}
    branches = {'TIMOR', 'TRITURA', 'CEMARA'}
    levels = {'Private', 'Sergeant', 'Lt. Colonel', 'Colonel', 'General', 'Lt. General'}
    houses = {'House of Havaria', 'House of Thenova', 'House of Quorion', 'House of Reverion', 'House of Creanova'}
    ajy_set = {'Junior', 'Youth', 'Apprentice'}

    records = []
    current_lines = []

    # Let's inspect line indices where a new record starts.
    record_starts = []
    for i in range(len(lines)):
        line = lines[i]
        if re.match(r'^\d+$', line):
            val = int(line)
            # Check if this line is an ID
            # Next line should be a Name (text that doesn't match predefined keywords or numbers)
            if i + 1 < len(lines):
                next_l = lines[i+1]
                if not re.match(r'^\d+$', next_l) and next_l not in genders and next_l not in memberships and not next_l.startswith('http'):
                    # Check if next next line (or line after) is Gender or Date of Birth or Program
                    if i + 2 < len(lines):
                        nn_l = lines[i+2]
                        if nn_l in genders or re.search(r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b', nn_l) or 'Program' in nn_l or nn_l in memberships or nn_l in branches:
                            record_starts.append(i)

    print(f"Total records identified: {len(record_starts)}")

    parsed_records = []
    for k in range(len(record_starts)):
        start_idx = record_starts[k]
        end_idx = record_starts[k+1] if k + 1 < len(record_starts) else len(lines)
        rec_lines = lines[start_idx:end_idx]
        
        # Parse rec_lines into a dictionary
        # rec_lines[0] is ID
        # rec_lines[1] is Name
        rec_id = rec_lines[0]
        rec_name = rec_lines[1]
        
        # Let's classify remaining lines
        rec = {
            'id': rec_id,
            'name': rec_name,
            'gender': None,
            'date_of_birth': None,
            'nama_sekolah': None,
            'cleaned_program': None,
            'membership': None,
            'expiry_date': None,
            'cabang_id': None,
            'first_enroll': None,
            'class': None,
            'house': None,
            'level': None,
            'house_role': None,
            'cabang_kelas': None,
            'newest_grade': None,
            'trainee_homeroom': None,
            'screening_test': None,
            'draft_grade': None,
            'prev_grade': None,
            'ajy_by_class': None,
            'last_real_stage': None
        }

        # Process tokens in rec_lines[2:]
        idx = 2
        while idx < len(rec_lines):
            val = rec_lines[idx]
            
            if val in genders and rec['gender'] is None:
                rec['gender'] = val
            elif val in memberships and rec['membership'] is None:
                rec['membership'] = val
            elif val in houses and rec['house'] is None:
                rec['house'] = val
            elif val in levels and rec['level'] is None:
                rec['level'] = val
            elif val in ajy_set and rec['ajy_by_class'] is None:
                rec['ajy_by_class'] = val
            elif 'Program' in val or 'Professionals' in val or 'Bangun' in val:
                rec['cleaned_program'] = val
            elif val.startswith('[http') or val.startswith('http'):
                rec['screening_test'] = val
            elif val in branches:
                if rec['cabang_id'] is None:
                    rec['cabang_id'] = val
                elif rec['cabang_kelas'] is None:
                    rec['cabang_kelas'] = val
            elif re.search(r'\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2,4}', val, re.IGNORECASE) or re.search(r'\d{1,2}/\d{1,2}/\d{2,4}', val):
                # Date!
                # Dates could be: date_of_birth, expiry_date, first_enroll, last_real_stage
                if rec['date_of_birth'] is None and rec['membership'] is None:
                    rec['date_of_birth'] = val
                elif rec['membership'] is not None and rec['expiry_date'] is None and rec['first_enroll'] is None:
                    rec['expiry_date'] = val
                elif rec['cabang_id'] is not None and rec['first_enroll'] is None:
                    rec['first_enroll'] = val
                elif rec['last_real_stage'] is None:
                    rec['last_real_stage'] = val
            elif rec['class'] is None and (val in ['Obsidian', 'Waiting List', 'waiting list'] or '(' in val or any(c in val for c in ['Gates', 'Dale', 'Clinton', 'Einstein', 'Millman', 'Kiyosaki', 'Winfrey', 'Doyle', 'Spielberg', 'Ziglar', 'Batari', 'Apprentice', 'Neverland', 'Hogwarts', 'Narnia', 'Wonderland', 'Graham', 'Mandela', 'Ruby', 'Pearl', 'Amber', 'Alexandrite', 'Beryl', 'Sapphire', 'Jade', 'Topaz', 'Galileo', 'Gandhi', 'Lincoln', 'Grande', 'Denver', 'Atlanta', 'Auckland', 'Cairo', 'Eldorado', 'Asheville', 'Whomville', 'Canfield', 'Confidence'])):
                rec['class'] = val
            elif val in ['Loita', 'Ghaitsa', 'Muly', 'Rizky', 'Agustina', 'Nabilah']:
                rec['trainee_homeroom'] = val
            elif re.match(r'^\d{1,2}$', val):
                # Grade numbers or draft/prev grade
                if rec['newest_grade'] is None:
                    rec['newest_grade'] = val
                elif rec['draft_grade'] is None:
                    rec['draft_grade'] = val
                elif rec['prev_grade'] is None:
                    rec['prev_grade'] = val
            elif rec['nama_sekolah'] is None and rec['gender'] is not None and rec['cleaned_program'] is None:
                # Could be school name before program if school is specified
                rec['nama_sekolah'] = val
            elif rec['nama_sekolah'] is None and rec['gender'] is not None and rec['cleaned_program'] is not None and rec['membership'] is None:
                rec['nama_sekolah'] = val

            idx += 1
            
        parsed_records.append(rec)

    print("Sample parsed records:")
    for r in parsed_records[:5]:
        print(json.dumps(r, indent=2))
        
parse_all()

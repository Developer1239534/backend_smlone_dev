/**
 * Final Gold Point Rankings Seed Script
 * 208 rows across 8 sections:
 * - ALL BRANCH Junior (27), ALL BRANCH Youth (25)
 * - TIMOR Junior (26), TIMOR Youth (29)
 * - TRITURA Junior (25), TRITURA Youth (25)
 * - CEMARA Junior (26), CEMARA Youth (25)
 * 
 * Period: 7/31/2026
 * Rankings computed using standard competition ranking (1,2,2,4 not 1,2,2,3)
 * Class names stripped of schedule parenthetical
 */

const db = require('../src/db/neonClient');
const fs = require('fs');
const path = require('path');

const PERIOD = '7/31/2026';

// Helper: clean class name - remove schedule parenthetical
function cleanClassName(name) {
  return name.replace(/\s*\(.*?\)\s*$/, '').trim();
}

// Helper: compute standard competition ranking
function computeRanks(entries) {
  // Sort by total_gold descending
  entries.sort((a, b) => b.total_gold - a.total_gold);
  let rank = 1;
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].total_gold < entries[i - 1].total_gold) {
      rank = i + 1;
    }
    entries[i].ranking = rank;
  }
  return entries;
}

// ============================================================
// ALL DATA (208 entries)
// ============================================================
const allData = [
  // === SECTION 1: ALL BRANCH - Junior (27 rows) ===
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '440', trainee_name: 'Sofia Grace Wu', membership_status: 'Active', level: 'Colonel', house: 'House of Creanova', class_name: 'Gladwell', branch: 'TIMOR', total_gold: 890 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '90100138', trainee_name: 'Vyon Wynter Huang', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Pearl', branch: 'CEMARA', total_gold: 710 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '90100005', trainee_name: 'Felynn Holy Richson', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Thenova', class_name: 'Pearl', branch: 'CEMARA', total_gold: 545 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '914', trainee_name: 'Leia Kaytlyn Tioe', membership_status: 'Active (Grace Period)', level: 'Private', house: 'House of Creanova', class_name: 'Lincoln', branch: 'TIMOR', total_gold: 500 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '950', trainee_name: 'Audrey Madison Loewe', membership_status: 'Active', level: 'Private', house: 'House of Havaria', class_name: 'Lincoln', branch: 'TIMOR', total_gold: 480 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100153', trainee_name: 'Dareen Azel Matthew Sembiring', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 480 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '90100160', trainee_name: 'Klarissa Evania Buhari', membership_status: 'Active', level: 'Private', house: 'House of Reverion', class_name: 'Pearl', branch: 'CEMARA', total_gold: 460 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '90100232', trainee_name: 'Kathrine Chrestella', membership_status: 'Active', level: 'Private', house: '', class_name: 'Pearl', branch: 'CEMARA', total_gold: 460 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100098', trainee_name: 'Erland Sohilida Laia', membership_status: 'Active (Grace Period)', level: 'Sergeant', house: 'House of Thenova', class_name: 'Cairo', branch: 'TRITURA', total_gold: 455 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '683', trainee_name: 'Stanley Ace Lorence', membership_status: 'Active (Grace Period)', level: 'Colonel', house: 'House of Thenova', class_name: 'Tracy', branch: 'TIMOR', total_gold: 450 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '1146', trainee_name: 'Charis Yafa Tobing', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Maxwell', branch: 'TIMOR', total_gold: 430 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100160', trainee_name: 'Jordan Noel Yap', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Denver', branch: 'TRITURA', total_gold: 405 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '90100190', trainee_name: 'Daphne Nathania Ang', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Alexandrite', branch: 'CEMARA', total_gold: 370 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100166', trainee_name: 'Farrin Rafania Shezan Lubis', membership_status: 'Active', level: 'Private', house: 'House of Havaria', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 360 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100191', trainee_name: 'Yosihana Hutasoit', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Cairo', branch: 'TRITURA', total_gold: 360 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100028', trainee_name: 'Elaine Gwen Lim', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Quorion', class_name: 'Cairo', branch: 'TRITURA', total_gold: 340 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100023', trainee_name: 'Evonne Gwen Lim', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Cairo', branch: 'TRITURA', total_gold: 330 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '809', trainee_name: 'Emilia Niko Nyoman', membership_status: 'Active (Grace Period)', level: 'Private', house: 'House of Thenova', class_name: 'Lincoln', branch: 'TIMOR', total_gold: 320 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '999', trainee_name: 'Annabelle Grace Wu', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Lincoln', branch: 'TIMOR', total_gold: 310 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '1040', trainee_name: 'Shane Anastasya Kristy Simangunsong', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Graham', branch: 'TIMOR', total_gold: 310 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '90100001', trainee_name: 'Rowan Maverick Ang', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Quartz', branch: 'CEMARA', total_gold: 310 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '90100183', trainee_name: 'Heinz victorio zhou', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Emerald', branch: 'CEMARA', total_gold: 295 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '255', trainee_name: 'Denzel Geraldo Wijaya', membership_status: 'Active', level: 'Sergeant', house: 'House of Reverion', class_name: 'Alexandrite', branch: 'CEMARA', total_gold: 280 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100059', trainee_name: 'Rebecca Florencia Siregar', membership_status: 'Active', level: 'Colonel', house: 'House of Havaria', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 280 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100156', trainee_name: 'Tengku Muhammad Malik Al Fatih', membership_status: 'Active (Grace Period)', level: 'Private', house: 'House of Havaria', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 280 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '70100174', trainee_name: 'Jerrick Onggoro Hakim', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Denver', branch: 'TRITURA', total_gold: 280 },
  { category: 'ALL BRANCH', program: 'Junior', trainee_id: '90100055', trainee_name: 'Felicia Tham', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Quartz', branch: 'CEMARA', total_gold: 280 },

  // === SECTION 2: ALL BRANCH - Youth (25 rows) ===
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '70100078', trainee_name: 'Sakina Alima Regune Harahap', membership_status: 'Active', level: 'Lt. General', house: 'House of Thenova', class_name: 'Atlanta', branch: 'TRITURA', total_gold: 1400 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '482', trainee_name: 'Reizo Kazuo Wong', membership_status: 'Active (Grace Period)', level: 'Colonel', house: 'House of Havaria', class_name: 'Grande', branch: 'TIMOR', total_gold: 830 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '896', trainee_name: 'Nicolas Carlie Kuwira', membership_status: 'Active', level: 'Lt. General', house: 'House of Havaria', class_name: 'Galileo', branch: 'TIMOR', total_gold: 620 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '90100020', trainee_name: 'Winston Hubert', membership_status: 'Active', level: 'Lt. General', house: 'House of Thenova', class_name: 'Ruby', branch: 'CEMARA', total_gold: 570 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '70100052', trainee_name: 'Darrel Hizkia Tambunan', membership_status: 'Active (Grace Period)', level: 'Lt. Colonel', house: 'House of Thenova', class_name: 'Athens', branch: 'TRITURA', total_gold: 530 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '90100206', trainee_name: 'Metta Louise ellen', membership_status: 'Active', level: 'Sergeant', house: 'House of Havaria', class_name: 'Azurite', branch: 'CEMARA', total_gold: 530 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '70100143', trainee_name: 'Kaleb Edgar Goel Hasugian', membership_status: 'Active', level: 'Sergeant', house: 'House of Quorion', class_name: 'Auckland', branch: 'TRITURA', total_gold: 490 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '803', trainee_name: 'Lovea Fendy Kho', membership_status: 'Active', level: 'Lt. General', house: 'House of Quorion', class_name: 'Grande', branch: 'TIMOR', total_gold: 460 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '745', trainee_name: 'Jesslyn', membership_status: 'Active', level: 'General', house: 'House of Thenova', class_name: 'Galileo', branch: 'TIMOR', total_gold: 450 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '442', trainee_name: 'Beatrys Vanesa Moiras', membership_status: 'Active (Grace Period)', level: 'Lt. General', house: 'House of Thenova', class_name: 'Kiyosaki', branch: 'TIMOR', total_gold: 440 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '483', trainee_name: 'Jolie Charlotte Huang', membership_status: 'Active', level: 'Lt. General', house: '', class_name: 'Topaz', branch: 'CEMARA', total_gold: 440 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '70100155', trainee_name: 'Stella Aprilia Sianipar', membership_status: 'Active', level: 'Sergeant', house: 'House of Reverion', class_name: 'Athens', branch: 'TRITURA', total_gold: 430 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '48', trainee_name: 'Justin Maxwell', membership_status: 'Active (Grace Period)', level: 'General', house: 'House of Havaria', class_name: 'Millman', branch: 'TIMOR', total_gold: 400 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '716', trainee_name: 'Chloe Vallerie Jie', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Reverion', class_name: 'Clinton', branch: 'TIMOR', total_gold: 400 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '90100143', trainee_name: 'Jason Lewis Theo', membership_status: 'Active', level: 'Sergeant', house: 'House of Quorion', class_name: 'Azurite', branch: 'CEMARA', total_gold: 390 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '90100153', trainee_name: 'Ethan Putra Gotama', membership_status: 'Active', level: 'Sergeant', house: 'House of Havaria', class_name: 'Ruby', branch: 'CEMARA', total_gold: 390 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '872', trainee_name: 'Kenneth Samuel Lim', membership_status: 'Active (Grace Period)', level: 'Lt. Colonel', house: 'House of Creanova', class_name: 'DaVinci', branch: 'TIMOR', total_gold: 385 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '1027', trainee_name: 'Elnino Jehanra Saragih', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Creanova', class_name: 'Spielberg', branch: 'TIMOR', total_gold: 360 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '70100042', trainee_name: 'Jessica Sharon', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Havaria', class_name: 'Athens', branch: 'TRITURA', total_gold: 360 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '70100047', trainee_name: 'Keyzia Faiana Daulay', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Quorion', class_name: 'Almeria', branch: 'TRITURA', total_gold: 335 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '90100127', trainee_name: 'Davin Bradford', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Azurite', branch: 'CEMARA', total_gold: 330 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '767', trainee_name: 'Theodore Joachim Wihardjo', membership_status: 'Active', level: 'Sergeant', house: 'House of Havaria', class_name: 'Grande', branch: 'TIMOR', total_gold: 320 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '90100200', trainee_name: 'Galent hansen wuner', membership_status: 'Active', level: 'Private', house: 'House of Quorion', class_name: 'Azurite', branch: 'CEMARA', total_gold: 320 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '70100046', trainee_name: 'Kirania Inara Azalea', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Thenova', class_name: 'Almeria', branch: 'TRITURA', total_gold: 310 },
  { category: 'ALL BRANCH', program: 'Youth', trainee_id: '90100097', trainee_name: 'Annabel Audriana', membership_status: 'Active', level: 'Sergeant', house: 'House of Quorion', class_name: 'Topaz', branch: 'CEMARA', total_gold: 310 },

  // === SECTION 3: TIMOR - Junior (26 rows) ===
  { category: 'TIMOR', program: 'Junior', trainee_id: '440', trainee_name: 'Sofia Grace Wu', membership_status: 'Active', level: 'Colonel', house: 'House of Creanova', class_name: 'Gladwell', branch: 'TIMOR', total_gold: 890 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '914', trainee_name: 'Leia Kaytlyn Tioe', membership_status: 'Active (Grace Period)', level: 'Private', house: 'House of Creanova', class_name: 'Lincoln', branch: 'TIMOR', total_gold: 500 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '950', trainee_name: 'Audrey Madison Loewe', membership_status: 'Active', level: 'Private', house: 'House of Havaria', class_name: 'Lincoln', branch: 'TIMOR', total_gold: 480 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '683', trainee_name: 'Stanley Ace Lorence', membership_status: 'Active (Grace Period)', level: 'Colonel', house: 'House of Thenova', class_name: 'Tracy', branch: 'TIMOR', total_gold: 450 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '1146', trainee_name: 'Charis Yafa Tobing', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Maxwell', branch: 'TIMOR', total_gold: 430 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '809', trainee_name: 'Emilia Niko Nyoman', membership_status: 'Active (Grace Period)', level: 'Private', house: 'House of Thenova', class_name: 'Lincoln', branch: 'TIMOR', total_gold: 320 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '999', trainee_name: 'Annabelle Grace Wu', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Lincoln', branch: 'TIMOR', total_gold: 310 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '1040', trainee_name: 'Shane Anastasya Kristy Simangunsong', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Graham', branch: 'TIMOR', total_gold: 310 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '763', trainee_name: 'Safira Reynia Hanum', membership_status: 'Active', level: 'Private', house: 'House of Quorion', class_name: 'Lincoln', branch: 'TIMOR', total_gold: 270 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '927', trainee_name: 'Richela Stanlay', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Dale', branch: 'TIMOR', total_gold: 270 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '857', trainee_name: 'Hogan Chan', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Thenova', class_name: 'Tracy', branch: 'TIMOR', total_gold: 240 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '784', trainee_name: 'Garrix Ardent Putra', membership_status: 'Active', level: 'Private', house: 'House of Havaria', class_name: 'Lincoln', branch: 'TIMOR', total_gold: 220 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '995', trainee_name: 'Qori Putri Syahviah', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Gladwell', branch: 'TIMOR', total_gold: 210 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '865', trainee_name: 'Victoria Yap', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Thenova', class_name: 'Tracy', branch: 'TIMOR', total_gold: 200 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '989', trainee_name: 'Federico Fredelyn Jeoh', membership_status: 'Active', level: 'Sergeant', house: 'House of Havaria', class_name: 'Gladwell', branch: 'TIMOR', total_gold: 200 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '751', trainee_name: 'Howie Chan', membership_status: 'Active', level: 'Colonel', house: 'House of Thenova', class_name: 'Tracy', branch: 'TIMOR', total_gold: 190 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '859', trainee_name: 'Clarissa Kho', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Graham', branch: 'TIMOR', total_gold: 190 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '988', trainee_name: 'Gavyn Wijaya', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Maxwell', branch: 'TIMOR', total_gold: 190 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '942', trainee_name: 'Elaine Viandi', membership_status: 'Active', level: 'Sergeant', house: 'House of Havaria', class_name: 'Dale', branch: 'TIMOR', total_gold: 180 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '1010', trainee_name: 'Gracielle Grace Ong', membership_status: 'Active (Grace Period)', level: 'Private', house: 'House of Havaria', class_name: 'Mandela', branch: 'TIMOR', total_gold: 180 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '811', trainee_name: 'Arthur Floyd Salim', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Lincoln', branch: 'TIMOR', total_gold: 170 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '1019', trainee_name: 'Louis Clinton Chai', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Mandela', branch: 'TIMOR', total_gold: 170 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '1060', trainee_name: 'Zac Aldrich Mayor', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Dale', branch: 'TIMOR', total_gold: 170 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '1079', trainee_name: 'Keigo Kusuno Soh', membership_status: 'Active', level: 'Private', house: 'House of Reverion', class_name: 'Tracy', branch: 'TIMOR', total_gold: 170 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '1044', trainee_name: 'Dominic Kie', membership_status: 'Active (Grace Period)', level: 'Sergeant', house: 'House of Quorion', class_name: 'Tracy', branch: 'TIMOR', total_gold: 160 },
  { category: 'TIMOR', program: 'Junior', trainee_id: '1147', trainee_name: 'Calista Kasih Aprilia Harahap', membership_status: 'Active', level: 'Private', house: 'House of Reverion', class_name: 'Marley', branch: 'TIMOR', total_gold: 160 },

  // === SECTION 4: TIMOR - Youth (29 rows) ===
  { category: 'TIMOR', program: 'Youth', trainee_id: '482', trainee_name: 'Reizo Kazuo Wong', membership_status: 'Active (Grace Period)', level: 'Colonel', house: 'House of Havaria', class_name: 'Grande', branch: 'TIMOR', total_gold: 830 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '896', trainee_name: 'Nicolas Carlie Kuwira', membership_status: 'Active', level: 'Lt. General', house: 'House of Havaria', class_name: 'Galileo', branch: 'TIMOR', total_gold: 620 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '803', trainee_name: 'Lovea Fendy Kho', membership_status: 'Active', level: 'Lt. General', house: 'House of Quorion', class_name: 'Grande', branch: 'TIMOR', total_gold: 460 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '745', trainee_name: 'Jesslyn', membership_status: 'Active', level: 'General', house: 'House of Thenova', class_name: 'Galileo', branch: 'TIMOR', total_gold: 450 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '442', trainee_name: 'Beatrys Vanesa Moiras', membership_status: 'Active (Grace Period)', level: 'Lt. General', house: 'House of Thenova', class_name: 'Kiyosaki', branch: 'TIMOR', total_gold: 440 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '48', trainee_name: 'Justin Maxwell', membership_status: 'Active (Grace Period)', level: 'General', house: 'House of Havaria', class_name: 'Millman', branch: 'TIMOR', total_gold: 400 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '716', trainee_name: 'Chloe Vallerie Jie', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Reverion', class_name: 'Clinton', branch: 'TIMOR', total_gold: 400 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '872', trainee_name: 'Kenneth Samuel Lim', membership_status: 'Active (Grace Period)', level: 'Lt. Colonel', house: 'House of Creanova', class_name: 'DaVinci', branch: 'TIMOR', total_gold: 385 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '1027', trainee_name: 'Elnino Jehanra Saragih', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Creanova', class_name: 'Spielberg', branch: 'TIMOR', total_gold: 360 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '767', trainee_name: 'Theodore Joachim Wihardjo', membership_status: 'Active', level: 'Sergeant', house: 'House of Havaria', class_name: 'Grande', branch: 'TIMOR', total_gold: 320 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '904', trainee_name: 'Callista Aurelia Tasma', membership_status: 'Active', level: 'Colonel', house: 'House of Thenova', class_name: 'Galileo', branch: 'TIMOR', total_gold: 290 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '1034', trainee_name: 'Cherryl Riquelme Potan', membership_status: 'Active (Grace Period)', level: 'Sergeant', house: 'House of Havaria', class_name: 'Gandhi', branch: 'TIMOR', total_gold: 250 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '285', trainee_name: 'Clairine Joshanley', membership_status: 'Active', level: 'Colonel', house: 'House of Thenova', class_name: 'Clinton', branch: 'TIMOR', total_gold: 240 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '741', trainee_name: 'Brayden Lisman', membership_status: 'Active', level: 'Colonel', house: 'House of Quorion', class_name: 'Galileo', branch: 'TIMOR', total_gold: 240 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '1077', trainee_name: 'Alqueenza Syifa Winona', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Clinton', branch: 'TIMOR', total_gold: 240 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '738', trainee_name: 'Adeline Njo', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Havaria', class_name: 'DaVinci', branch: 'TIMOR', total_gold: 235 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '850', trainee_name: 'Karin Destynsia', membership_status: 'Active (Grace Period)', level: 'Colonel', house: 'House of Thenova', class_name: 'DaVinci', branch: 'TIMOR', total_gold: 235 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '675', trainee_name: 'Maxen Zo Leon', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Havaria', class_name: 'Gates', branch: 'TIMOR', total_gold: 220 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '1164', trainee_name: 'Felicia Ivana Silalahi', membership_status: 'Active', level: 'Private', house: 'House of Creanova', class_name: 'DaVinci', branch: 'TIMOR', total_gold: 220 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '680', trainee_name: 'Gracelyn Yap', membership_status: 'Active', level: 'Lt. General', house: 'House of Quorion', class_name: 'Galileo', branch: 'TIMOR', total_gold: 210 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '141', trainee_name: 'Russell William Tanner', membership_status: 'Active', level: 'Colonel', house: 'House of Quorion', class_name: 'DaVinci', branch: 'TIMOR', total_gold: 200 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '1161', trainee_name: 'Randa Miracle Boasly Sihombing', membership_status: 'Active', level: 'Private', house: '', class_name: 'Galileo', branch: 'TIMOR', total_gold: 200 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '274', trainee_name: 'Candice Winardi Wong', membership_status: 'Active', level: 'Colonel', house: 'House of Havaria', class_name: 'Spielberg', branch: 'TIMOR', total_gold: 190 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '1058', trainee_name: 'Gracia Tiffany Susanto', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Canfield', branch: 'TIMOR', total_gold: 190 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '801', trainee_name: 'Hillary Calista Tamado Panjaitan', membership_status: 'Active', level: 'Colonel', house: 'House of Thenova', class_name: 'Kiyosaki', branch: 'TIMOR', total_gold: 180 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '1038', trainee_name: 'Devon Jau', membership_status: 'Active (Grace Period)', level: 'Sergeant', house: 'House of Creanova', class_name: 'Canfield', branch: 'TIMOR', total_gold: 180 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '1131', trainee_name: 'Vinxiero Carrick Francoiz', membership_status: 'Active (Grace Period)', level: 'Private', house: 'House of Thenova', class_name: 'Kiyosaki', branch: 'TIMOR', total_gold: 180 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '1139', trainee_name: 'Wilbert Wijaya', membership_status: 'Active', level: 'Private', house: 'House of Quorion', class_name: 'Millman', branch: 'TIMOR', total_gold: 180 },
  { category: 'TIMOR', program: 'Youth', trainee_id: '1157', trainee_name: 'Gywen Stefanie Wiley', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Ziglar', branch: 'TIMOR', total_gold: 180 },

  // === SECTION 5: TRITURA - Junior (25 rows) ===
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100153', trainee_name: 'Dareen Azel Matthew Sembiring', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 480 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100098', trainee_name: 'Erland Sohilida Laia', membership_status: 'Active (Grace Period)', level: 'Sergeant', house: 'House of Thenova', class_name: 'Cairo', branch: 'TRITURA', total_gold: 455 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100160', trainee_name: 'Jordan Noel Yap', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Denver', branch: 'TRITURA', total_gold: 405 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100166', trainee_name: 'Farrin Rafania Shezan Lubis', membership_status: 'Active', level: 'Private', house: 'House of Havaria', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 360 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100191', trainee_name: 'Yosihana Hutasoit', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Cairo', branch: 'TRITURA', total_gold: 360 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100028', trainee_name: 'Elaine Gwen Lim', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Quorion', class_name: 'Cairo', branch: 'TRITURA', total_gold: 340 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100023', trainee_name: 'Evonne Gwen Lim', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Cairo', branch: 'TRITURA', total_gold: 330 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100059', trainee_name: 'Rebecca Florencia Siregar', membership_status: 'Active', level: 'Colonel', house: 'House of Havaria', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 280 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100156', trainee_name: 'Tengku Muhammad Malik Al Fatih', membership_status: 'Active (Grace Period)', level: 'Private', house: 'House of Havaria', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 280 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100174', trainee_name: 'Jerrick Onggoro Hakim', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Denver', branch: 'TRITURA', total_gold: 280 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100090', trainee_name: 'Annisa Letizia Shanum', membership_status: 'Active', level: 'Sergeant', house: 'House of Reverion', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 270 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100122', trainee_name: 'Shadrina Azheema Lubis', membership_status: 'Active', level: 'Sergeant', house: 'House of Creanova', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 250 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100186', trainee_name: 'Alvaro Gavriel Batara Sihotang', membership_status: 'Active', level: 'Private', house: 'House of Havaria', class_name: 'Cairo', branch: 'TRITURA', total_gold: 235 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100188', trainee_name: 'Latisya Naya Alamsyah Nasution', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 225 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100159', trainee_name: 'Nadia Fathaniah Chandra', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 210 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100004', trainee_name: 'Maryam Shareen Anandifa', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Havaria', class_name: 'Denver', branch: 'TRITURA', total_gold: 190 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100179', trainee_name: 'Doria Marchisia Giussevine Saragih', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Cairo', branch: 'TRITURA', total_gold: 190 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100193', trainee_name: 'Nadhira Ayria Verdian', membership_status: 'Active', level: '', house: 'House of Havaria', class_name: 'Cairo', branch: 'TRITURA', total_gold: 180 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100064', trainee_name: 'Rachel Nathania Situmorang', membership_status: 'Active (Grace Period)', level: 'Sergeant', house: 'House of Creanova', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 160 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100150', trainee_name: 'Nadhira Calista Purba', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 150 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100180', trainee_name: 'Jevano Septarey Saragih', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Cairo', branch: 'TRITURA', total_gold: 150 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100123', trainee_name: 'Shafiqa Adeeva Lubis', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Eldorado', branch: 'TRITURA', total_gold: 140 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100106', trainee_name: 'Dareen Davinci Ginting', membership_status: 'Active', level: 'Sergeant', house: 'House of Havaria', class_name: 'Denver', branch: 'TRITURA', total_gold: 120 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100184', trainee_name: 'Atha Malik Chairmawan', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Denver', branch: 'TRITURA', total_gold: 90 },
  { category: 'TRITURA', program: 'Junior', trainee_id: '70100176', trainee_name: 'Muhammad Asyam Haris Tanjung', membership_status: 'Active', level: 'Private', house: 'House of Quorion', class_name: 'Cairo', branch: 'TRITURA', total_gold: 80 },

  // === SECTION 6: TRITURA - Youth (25 rows) ===
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100078', trainee_name: 'Sakina Alima Regune Harahap', membership_status: 'Active', level: 'Lt. General', house: 'House of Thenova', class_name: 'Atlanta', branch: 'TRITURA', total_gold: 1400 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100052', trainee_name: 'Darrel Hizkia Tambunan', membership_status: 'Active (Grace Period)', level: 'Lt. Colonel', house: 'House of Thenova', class_name: 'Athens', branch: 'TRITURA', total_gold: 530 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100143', trainee_name: 'Kaleb Edgar Goel Hasugian', membership_status: 'Active', level: 'Sergeant', house: 'House of Quorion', class_name: 'Auckland', branch: 'TRITURA', total_gold: 490 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100155', trainee_name: 'Stella Aprilia Sianipar', membership_status: 'Active', level: 'Sergeant', house: 'House of Reverion', class_name: 'Athens', branch: 'TRITURA', total_gold: 430 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100042', trainee_name: 'Jessica Sharon', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Havaria', class_name: 'Athens', branch: 'TRITURA', total_gold: 360 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100047', trainee_name: 'Keyzia Faiana Daulay', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Quorion', class_name: 'Almeria', branch: 'TRITURA', total_gold: 335 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100046', trainee_name: 'Kirania Inara Azalea', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Thenova', class_name: 'Almeria', branch: 'TRITURA', total_gold: 310 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100134', trainee_name: 'Diandra Santika', membership_status: 'Active', level: 'Sergeant', house: 'House of Quorion', class_name: 'Athens', branch: 'TRITURA', total_gold: 300 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100168', trainee_name: 'Mora Leticia Sinaga', membership_status: 'Active', level: 'Private', house: 'House of Creanova', class_name: 'Almeria', branch: 'TRITURA', total_gold: 260 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100020', trainee_name: 'Diandra Ezra Nauli Simatupang', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Havaria', class_name: 'Athens', branch: 'TRITURA', total_gold: 250 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100130', trainee_name: 'Muhammad Rafa Al Siena', membership_status: 'Active', level: 'Sergeant', house: 'House of Quorion', class_name: 'Auckland', branch: 'TRITURA', total_gold: 240 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100019', trainee_name: 'Andrea Tabitha Florencia Simatupang', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Creanova', class_name: 'Athens', branch: 'TRITURA', total_gold: 230 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100117', trainee_name: 'Akhdan Arief Athaya', membership_status: 'Active', level: 'Sergeant', house: 'House of Havaria', class_name: 'Asheville', branch: 'TRITURA', total_gold: 230 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100185', trainee_name: 'Alice Nathalie Brigitta', membership_status: 'Active', level: 'Private', house: 'House of Quorion', class_name: 'Almeria', branch: 'TRITURA', total_gold: 230 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100135', trainee_name: 'Adib Nufal Wibowo', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Asheville', branch: 'TRITURA', total_gold: 220 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100121', trainee_name: 'Shane Anthony Jawson', membership_status: 'Active', level: 'Sergeant', house: 'House of Quorion', class_name: 'Auckland', branch: 'TRITURA', total_gold: 210 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100127', trainee_name: 'Gabriel Ihut Martuaro Sihombing', membership_status: 'Active', level: 'Sergeant', house: 'House of Havaria', class_name: 'Atlanta', branch: 'TRITURA', total_gold: 210 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100136', trainee_name: 'Syakirah Khairani Jamilah', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Asheville', branch: 'TRITURA', total_gold: 210 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100076', trainee_name: 'Marwa Alya Sakinah Rangkuti', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Thenova', class_name: 'Athens', branch: 'TRITURA', total_gold: 200 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100144', trainee_name: 'Faqih Fadhilah Wijaya', membership_status: 'Active', level: 'Private', house: 'House of Quorion', class_name: 'Asheville', branch: 'TRITURA', total_gold: 200 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100147', trainee_name: 'Faza Kiyana Azdah', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Athens', branch: 'TRITURA', total_gold: 180 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100149', trainee_name: 'Jaeson Nathan Yap', membership_status: 'Active', level: 'Private', house: 'House of Quorion', class_name: 'Auckland', branch: 'TRITURA', total_gold: 180 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100005', trainee_name: 'Lyvia Verlynn', membership_status: 'Active', level: 'Colonel', house: 'House of Thenova', class_name: 'Almeria', branch: 'TRITURA', total_gold: 170 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100139', trainee_name: 'Daniella Demeintieva', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Auckland', branch: 'TRITURA', total_gold: 170 },
  { category: 'TRITURA', program: 'Youth', trainee_id: '70100158', trainee_name: 'Gracelyn Patricia', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Atlanta', branch: 'TRITURA', total_gold: 170 },

  // === SECTION 7: CEMARA - Junior (26 rows) ===
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100138', trainee_name: 'Vyon Wynter Huang', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Pearl', branch: 'CEMARA', total_gold: 710 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100005', trainee_name: 'Felynn Holy Richson', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Thenova', class_name: 'Pearl', branch: 'CEMARA', total_gold: 545 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100160', trainee_name: 'Klarissa Evania Buhari', membership_status: 'Active', level: 'Private', house: 'House of Reverion', class_name: 'Pearl', branch: 'CEMARA', total_gold: 460 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100232', trainee_name: 'Kathrine Chrestella', membership_status: 'Active', level: 'Private', house: '', class_name: 'Pearl', branch: 'CEMARA', total_gold: 460 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100190', trainee_name: 'Daphne Nathania Ang', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Alexandrite', branch: 'CEMARA', total_gold: 370 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100001', trainee_name: 'Rowan Maverick Ang', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Quartz', branch: 'CEMARA', total_gold: 310 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100183', trainee_name: 'Heinz victorio zhou', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Emerald', branch: 'CEMARA', total_gold: 295 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '255', trainee_name: 'Denzel Geraldo Wijaya', membership_status: 'Active', level: 'Sergeant', house: 'House of Reverion', class_name: 'Alexandrite', branch: 'CEMARA', total_gold: 280 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100055', trainee_name: 'Felicia Tham', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Quartz', branch: 'CEMARA', total_gold: 280 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '639', trainee_name: 'Bianca Olivia Ruslie', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Alexandrite', branch: 'CEMARA', total_gold: 270 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100081', trainee_name: 'Hayden Fredderick Halim', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Havaria', class_name: 'Diamond', branch: 'CEMARA', total_gold: 270 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100044', trainee_name: 'Velove Alexa Winstan', membership_status: 'Active', level: 'Sergeant', house: 'House of Creanova', class_name: 'Amethyst', branch: 'CEMARA', total_gold: 250 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100004', trainee_name: 'Jeovenna Cangie', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Havaria', class_name: 'Diamond', branch: 'CEMARA', total_gold: 240 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100235', trainee_name: 'Hermione Emmilia Artjim', membership_status: 'Active', level: 'Private', house: '', class_name: 'Emerald', branch: 'CEMARA', total_gold: 230 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '1081', trainee_name: 'Carlton Kho', membership_status: 'Active', level: 'Private', house: 'House of Havaria', class_name: 'Pearl', branch: 'CEMARA', total_gold: 225 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100148', trainee_name: 'Kei Evander Buhari', membership_status: 'Active', level: 'Sergeant', house: 'House of Reverion', class_name: 'Diamond', branch: 'CEMARA', total_gold: 210 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '490', trainee_name: 'Shane Ferrucio Lim', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Havaria', class_name: 'Alexandrite', branch: 'CEMARA', total_gold: 202 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100070', trainee_name: 'Jack Austin Sia', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Quartz', branch: 'CEMARA', total_gold: 190 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100108', trainee_name: 'Vergio Gavino Chaikoff', membership_status: 'Active', level: 'Private', house: 'House of Havaria', class_name: 'Amethyst', branch: 'CEMARA', total_gold: 180 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100024', trainee_name: 'Welceline Charissa Tsjin', membership_status: 'Active (Grace Period)', level: 'Sergeant', house: 'House of Thenova', class_name: 'Diamond', branch: 'CEMARA', total_gold: 160 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100116', trainee_name: 'Janessa Hofang', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Emerald', branch: 'CEMARA', total_gold: 155 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100010', trainee_name: 'Chloe Marjorie Wen', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Diamond', branch: 'CEMARA', total_gold: 130 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100011', trainee_name: 'Chloe Quisha Anggara', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Diamond', branch: 'CEMARA', total_gold: 130 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100049', trainee_name: 'Harvey Susanto', membership_status: 'Active', level: 'Sergeant', house: 'House of Havaria', class_name: 'Alexandrite', branch: 'CEMARA', total_gold: 130 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100060', trainee_name: 'Alfred Smaver Tanasal', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Amber', branch: 'CEMARA', total_gold: 130 },
  { category: 'CEMARA', program: 'Junior', trainee_id: '90100245', trainee_name: 'Mason Ivander Cahaya', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Alexandrite', branch: 'CEMARA', total_gold: 130 },

  // === SECTION 8: CEMARA - Youth (25 rows) ===
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100020', trainee_name: 'Winston Hubert', membership_status: 'Active', level: 'Lt. General', house: 'House of Thenova', class_name: 'Ruby', branch: 'CEMARA', total_gold: 570 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100206', trainee_name: 'Metta Louise ellen', membership_status: 'Active', level: 'Sergeant', house: 'House of Havaria', class_name: 'Azurite', branch: 'CEMARA', total_gold: 530 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '483', trainee_name: 'Jolie Charlotte Huang', membership_status: 'Active', level: 'Lt. General', house: '', class_name: 'Topaz', branch: 'CEMARA', total_gold: 440 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100143', trainee_name: 'Jason Lewis Theo', membership_status: 'Active', level: 'Sergeant', house: 'House of Quorion', class_name: 'Azurite', branch: 'CEMARA', total_gold: 390 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100153', trainee_name: 'Ethan Putra Gotama', membership_status: 'Active', level: 'Sergeant', house: 'House of Havaria', class_name: 'Ruby', branch: 'CEMARA', total_gold: 390 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100127', trainee_name: 'Davin Bradford', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Azurite', branch: 'CEMARA', total_gold: 330 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100200', trainee_name: 'Galent hansen wuner', membership_status: 'Active', level: 'Private', house: 'House of Quorion', class_name: 'Azurite', branch: 'CEMARA', total_gold: 320 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100097', trainee_name: 'Annabel Audriana', membership_status: 'Active', level: 'Sergeant', house: 'House of Quorion', class_name: 'Topaz', branch: 'CEMARA', total_gold: 310 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100080', trainee_name: 'Vanessa Cangie', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Havaria', class_name: 'Topaz', branch: 'CEMARA', total_gold: 290 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '602', trainee_name: 'Alexandra Joan Micheline', membership_status: 'Active', level: 'Colonel', house: 'House of Creanova', class_name: 'Jade', branch: 'CEMARA', total_gold: 265 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100217', trainee_name: 'CHARLIE MIKKELSEN YAP', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Azurite', branch: 'CEMARA', total_gold: 240 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100236', trainee_name: 'WINSTON XAVERIUS JUNIO', membership_status: 'Active', level: 'Private', house: 'House of Creanova', class_name: 'Azurite', branch: 'CEMARA', total_gold: 240 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100068', trainee_name: 'Ixchel Lowell Tankiono', membership_status: 'Active', level: 'Sergeant', house: 'House of Creanova', class_name: 'Jade', branch: 'CEMARA', total_gold: 220 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100002', trainee_name: 'Giselle Liandy', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Quorion', class_name: 'Topaz', branch: 'CEMARA', total_gold: 200 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100056', trainee_name: 'Thalissha Yeonan', membership_status: 'Active', level: 'Sergeant', house: 'House of Quorion', class_name: 'Ruby', branch: 'CEMARA', total_gold: 200 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100221', trainee_name: 'Ryan Aurelio Bustamin', membership_status: 'Active', level: 'Private', house: 'House of Havaria', class_name: 'Jade', branch: 'CEMARA', total_gold: 190 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100022', trainee_name: 'Jeanice Wu', membership_status: 'Active', level: 'Sergeant', house: 'House of Quorion', class_name: 'Ruby', branch: 'CEMARA', total_gold: 180 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100082', trainee_name: 'Tang En Xin', membership_status: 'Active', level: 'Sergeant', house: 'House of Quorion', class_name: 'Ruby', branch: 'CEMARA', total_gold: 180 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '868', trainee_name: 'Sergio Garcia Ang', membership_status: 'Active', level: 'Lt. Colonel', house: 'House of Creanova', class_name: 'Beryl', branch: 'CEMARA', total_gold: 160 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100067', trainee_name: 'Victor Alexander Winstan', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Topaz', branch: 'CEMARA', total_gold: 160 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100036', trainee_name: 'Carlos Ferdinand Putra', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Jade', branch: 'CEMARA', total_gold: 145 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '329', trainee_name: 'Vrederick Benaricco Tanjaya', membership_status: 'Active (Grace Period)', level: 'Colonel', house: 'House of Thenova', class_name: 'Sapphire', branch: 'CEMARA', total_gold: 140 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100204', trainee_name: 'Chloe Wong', membership_status: 'Active', level: 'Private', house: 'House of Havaria', class_name: 'Jade', branch: 'CEMARA', total_gold: 135 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '1020', trainee_name: 'Caren Axella Natania Lumbantoruan', membership_status: 'Active', level: 'Sergeant', house: 'House of Thenova', class_name: 'Beryl', branch: 'CEMARA', total_gold: 130 },
  { category: 'CEMARA', program: 'Youth', trainee_id: '90100043', trainee_name: 'Valentino Owen Liu', membership_status: 'Active', level: 'Private', house: 'House of Thenova', class_name: 'Jade', branch: 'CEMARA', total_gold: 125 },
];

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log(`📊 Total entries: ${allData.length}`);

  // Clean class names and trim names
  allData.forEach(e => {
    e.class_name = cleanClassName(e.class_name);
    e.trainee_name = e.trainee_name.trim();
  });

  // Group by section (category + program) and compute ranks
  const sections = {};
  allData.forEach(e => {
    const key = `${e.category}|${e.program}`;
    if (!sections[key]) sections[key] = [];
    sections[key].push(e);
  });

  // Compute ranks per section
  Object.keys(sections).forEach(key => {
    computeRanks(sections[key]);
  });

  // Flatten back
  const finalData = Object.values(sections).flat();

  // Print summary
  console.log('\n📋 Section Summary:');
  Object.entries(sections).forEach(([key, entries]) => {
    console.log(`  ${key}: ${entries.length} entries`);
  });

  // TRUNCATE and INSERT
  console.log('\n🗑️  Truncating gold_point_rankings table...');
  await db.query('TRUNCATE TABLE gold_point_rankings RESTART IDENTITY CASCADE;');

  // Build batch insert
  const values = [];
  const placeholders = [];
  let idx = 1;

  finalData.forEach(e => {
    placeholders.push(`($${idx}, $${idx+1}, $${idx+2}, $${idx+3}, $${idx+4}, $${idx+5}, $${idx+6}, $${idx+7}, $${idx+8}, $${idx+9}, $${idx+10}, $${idx+11})`);
    values.push(
      e.ranking, PERIOD, e.category, e.program, e.trainee_id,
      e.trainee_name, e.membership_status, e.level, e.house,
      e.class_name, e.branch, e.total_gold
    );
    idx += 12;
  });

  const insertQuery = `
    INSERT INTO gold_point_rankings (
      ranking, period, category, program, trainee_id,
      trainee_name, membership_status, level, house,
      class_name, branch, total_gold
    ) VALUES ${placeholders.join(',\n')};
  `;

  console.log(`📥 Inserting ${finalData.length} rows...`);
  await db.query(insertQuery, values);

  // Verify
  const countResult = await db.query('SELECT COUNT(*) FROM gold_point_rankings;');
  console.log(`\n✅ Total rows in gold_point_rankings: ${countResult.rows[0].count}`);

  // Verify per section
  const sectionResult = await db.query(
    'SELECT category, program, COUNT(*) as total FROM gold_point_rankings GROUP BY category, program ORDER BY category, program;'
  );
  console.log('\n📊 Per-section breakdown:');
  console.table(sectionResult.rows);

  // Export seed JSON
  const seedJson = finalData.map(e => ({
    ranking: e.ranking,
    period: PERIOD,
    category: e.category,
    program: e.program,
    trainee_id: e.trainee_id,
    trainee_name: e.trainee_name,
    membership_status: e.membership_status,
    level: e.level,
    house: e.house,
    class_name: e.class_name,
    branch: e.branch,
    total_gold: e.total_gold,
  }));

  const seedJsonStr = JSON.stringify(seedJson, null, 2);
  const seedPaths = [
    path.join(__dirname, 'seed_gold_point_rankings.json'),
    path.join(__dirname, '..', 'src', 'routes', 'seed_gold_point_rankings.json'),
    path.join(__dirname, '..', 'src', 'db', 'seed_gold_point_rankings.json'),
  ];

  seedPaths.forEach(p => {
    fs.writeFileSync(p, seedJsonStr, 'utf8');
    console.log(`📁 Written: ${p}`);
  });

  console.log(`\n🎉 Done! ${finalData.length} rows inserted and seed files updated.`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

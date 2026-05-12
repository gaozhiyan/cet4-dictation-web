import os
import re
import subprocess
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

mp3_file = "/Users/gao/Desktop/others/CET4/听力练习/2024四级真题及解析_for 艾薇/202512-set1/202512-set1.mp3"
srt_file = "/Users/gao/Desktop/others/CET4/听力练习/2024四级真题及解析_for 艾薇/202512-set1/202512-set1.srt"
output_dir = "/Users/gao/Desktop/others/CET4/dictation-web/public/audio/exam/202512set1"

os.makedirs(output_dir, exist_ok=True)

def parse_time(time_str):
    h, m, s = time_str.replace(',', '.').split(':')
    return int(h) * 3600 + int(m) * 60 + float(s)

with open(srt_file, 'r', encoding='utf-8') as f:
    content = f.read()

blocks = content.strip().split('\n\n')

# Find start indices
start_keywords = [
    r"News report 1",
    r"News report 2",
    r"News report 3",
    r"Conversation 1",
    r"Conversation two",
    r"Passage 1",
    r"Passage 2",
    r"Passage 3"
]

end_regexes = [
    re.compile(r"Question 2\b", re.IGNORECASE),
    re.compile(r"Question four\b", re.IGNORECASE),
    re.compile(r"Question 7\b", re.IGNORECASE),
    re.compile(r"Question 11\b", re.IGNORECASE),
    re.compile(r"Question 15\b", re.IGNORECASE),
    re.compile(r"Question 18\b", re.IGNORECASE),
    re.compile(r"Question 21\b", re.IGNORECASE),
    re.compile(r"Question 25\b", re.IGNORECASE),
]

start_times = []
end_times = []

for keyword in start_keywords:
    for block in blocks:
        lines = block.split('\n')
        if len(lines) >= 3:
            time_line = lines[1]
            text = ' '.join(lines[2:])
            if re.search(keyword, text, re.IGNORECASE):
                start_times.append(parse_time(time_line.split(' --> ')[0]))
                break

for regex in end_regexes:
    for block in blocks:
        lines = block.split('\n')
        if len(lines) >= 3:
            time_line = lines[1]
            text = ' '.join(lines[2:])
            if regex.search(text):
                end_times.append(parse_time(time_line.split(' --> ')[1]) + 15)
                break

print("Start times:", start_times)
print("End times:", end_times)

if len(start_times) != 8 or len(end_times) != 8:
    print("Error: Could not find all 8 passages start and end times.")
    exit(1)

for i in range(8):
    start_time = start_times[i]
    end_time = end_times[i]
    
    duration = end_time - start_time
    output_filename = f"exam-202512-set1-passage-{i}.mp3"
    output_path = os.path.join(output_dir, output_filename)
    
    print(f"Slicing Passage {i} ({start_time:.2f}s to {end_time:.2f}s) -> {output_filename}")
    
    cmd = [
        ffmpeg_exe,
        "-hide_banner",
        "-loglevel", "error",
        "-y",
        "-ss", str(start_time),
        "-to", str(end_time),
        "-i", mp3_file,
        "-ac", "1",
        "-ar", "16000",
        output_path
    ]
    
    subprocess.run(cmd, check=True)

print("Done slicing exam passages.")

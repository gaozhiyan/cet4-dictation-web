import os

file_path = "src/app/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "  // Render Menu\n  if (mode === 'menu') {\n    return ("
end_marker = "    )\n  }\n\n  // Render Stats"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Markers not found")
    exit(1)

new_menu_content = """  // Render Menu
  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-[#F4F4F0] text-zinc-900 font-sans selection:bg-[#0044FF] selection:text-white relative overflow-hidden">
        {/* Noise Overlay */}
        <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\\'0 0 200 200\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter id=\\'noiseFilter\\'%3E%3CfeTurbulence type=\\'import os

file_path = src/app/page.tsx
with open(
file_paveswith open(file_path, "r", enc\\    content = f.read()

start_marker = "  // Ren=\
start_marker = "  //eigend_marker = "    )\n  }\n\n  // Render Stats"

start_idx = content.find(start_m' }}></div>

        {/* Modals */}
        {send_idx = content.find(end_marker)

ias
if start_idx == -1 or end_idx ==80     print("Markers not found")
center    exit(1)

new_menu_contentk=
new_menu_Sho  if (mode === 'menu') {
    v     return (
      <div classNard      <div  w        {/* Noise Overlay */}
        <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-multiply" style={{ backss        <div className="poinwh
file_path = "src/app/page.tsx"
with open("
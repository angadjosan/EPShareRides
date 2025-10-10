import os

def count_lines_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return len(f.readlines())
    except:
        return 0

def main():
    root_dir = '.'
    extensions = ['.js', '.ejs', '.css', '.json', '.md', '.yaml']
    total_lines = 0
    for dirpath, dirnames, filenames in os.walk(root_dir):
        if 'node_modules' in dirnames:
            dirnames.remove('node_modules')
            filenames.remove('package-lock.json')
        for filename in filenames:
            if any(filename.endswith(ext) for ext in extensions) and 'min.' not in filename:
                filepath = os.path.join(dirpath, filename)
                lines = count_lines_in_file(filepath)
                total_lines += lines
    print(f"Total lines of code: {total_lines}")

if __name__ == "__main__":
    main()
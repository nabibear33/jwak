import sys
from .runtime import Lang_shung_jwak

def main():
    if len(sys.argv) != 2:
        print("How to use: python -m lang_shung_jwak <filename.jwak>")
        sys.exit(1)

    code = sys.argv[1]

    interpreter = Lang_shung_jwak()
    interpreter.compile(code)

if __name__ == "__main__":
    main()
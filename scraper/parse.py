import sys

def isInt(s):
    try: 
        int(s)
        return True
    except ValueError:
        return False

while True:
    line = sys.stdin.readline()
    if len(line) == 0:
        break
    leftP = line.find("(");
    rightP = line.find(")");
    name = line[1:leftP-2];
    netid = line[leftP+1:rightP];
    year = ", " + line[rightP+4:rightP+8] if isInt(line[rightP+4:rightP+8]) else ""

    print(name + ", " + netid + year);

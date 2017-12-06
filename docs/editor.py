import sys
import time
import traceback
import javascript

from browser import document as doc, window, alert

output = ''
# set height of container to 66% of screen
#_height = doc.documentElement.clientHeight
#_s = doc['container2']
#_s.style.height = '%spx' % int(_height * 0.66)

has_ace = True

if hasattr(window, 'localStorage'):
    from browser.local_storage import storage
else:
    storage = None

if 'set_debug' in doc:
    __BRYTHON__.debug = int(doc['set_debug'].checked)

class cOutput:

    def write(self, data):
        global output
        output += str(data)

    def flush(self):
        pass

sys.stdout = cOutput()
sys.stderr = cOutput()

def to_str(xx):
    return str(xx)



def show_console(ev):
    doc["console"].value = output
    doc["console"].cols = 60

# run a script, in global namespace if in_globals is True
def run(*args):
    global output

    key = window.uniqueKey
    index = window.runToIndex

    values = window.state[key].values

    namespace = {}

    for x in range(0, index + 1):
        output = ''

        src = values[x]

        t0 = time.perf_counter()
        try:
            exec(src, namespace)
            state = 1
        except Exception as exc:
            traceback.print_exc(file=sys.stderr)
            state = 0

        value = output + '\n' + ('<completed in %6.2f ms>' % ((time.perf_counter() - t0) * 1000.0))

        window.updateResults[key](value, x, state)

# def show_js(ev):
    # src = store.getState().userCode
    # doc[console].value = javascript.py2js(src, '__main__')

# if has_ace:
#     reset_src()
# else:
#     reset_src_area()

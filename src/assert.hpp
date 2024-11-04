#pragma once

#ifdef WASM
extern "C" void RunTimeException(const char*);
#ifdef NDEBUG
#define assert(_) (void)
#else
#define assert(asserted) {\
    if(!(asserted)) RunTimeException(#asserted); \
}
#endif


#else
#include <cassert>
#endif

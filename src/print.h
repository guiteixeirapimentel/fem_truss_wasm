#pragma once

#ifdef __cplusplus
extern "C" {
#endif

#ifndef WASM
#include <stdio.h>
#define print(...) printf(__VA_ARGS__)
#else
void print(const char*);
#endif

#ifdef __cplusplus
}
#endif

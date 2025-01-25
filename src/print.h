#pragma once

#ifdef __cplusplus
extern "C"
{
#endif

#ifndef WASM
#include <stdio.h>
#define print(str) printf("%s\n", str)
#else
void print(const char *);
#endif

#ifdef __cplusplus
}
#endif

#pragma once
#include "stdint.h"

#ifdef WASM

void* operator new(std::size_t count);
void operator delete(void* ptr) noexcept;

void* operator new[]( std::size_t count );
void operator delete[](void* ptr) noexcept;

#endif
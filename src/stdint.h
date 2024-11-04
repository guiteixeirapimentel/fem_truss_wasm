#pragma once

#ifndef WASM
#include <cstdint>
#else
namespace std
{
    using size_t = unsigned long;
}
#endif

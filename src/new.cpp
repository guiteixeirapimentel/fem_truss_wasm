#include "new.hpp"

#ifdef WASM
extern "C" void* malloc(std::size_t count);
extern "C" void free(void* ptr);

void *operator new(std::size_t count)
{
    return malloc(count);
}

void operator delete(void* ptr) noexcept
{
    free(ptr);
}

void *operator new[](std::size_t count)
{
    return malloc(count);
}

void operator delete[](void* ptr) noexcept
{
    free(ptr);
}
#endif

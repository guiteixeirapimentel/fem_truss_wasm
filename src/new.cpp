#include "new.hpp"

#ifdef WASM
extern "C" void* malloc(std::size_t count);
extern "C" void free(void* ptr);

constexpr auto alignment = 8;

void* operator new(std::size_t count)
{
    const auto remainder = count % alignment;
    const auto n_bytes = remainder > alignment / 2 ? count - remainder : count + (alignment - remainder);
    return malloc(n_bytes);
}

void operator delete(void* ptr) noexcept
{
    free(ptr);
}

void* operator new[](std::size_t count)
{
    const auto remainder = count % alignment;
    const auto n_bytes = remainder > alignment / 2 ? count - remainder : count + (alignment - remainder);
    return malloc(count);
}

void operator delete[](void* ptr) noexcept
{
    free(ptr);
}
#endif

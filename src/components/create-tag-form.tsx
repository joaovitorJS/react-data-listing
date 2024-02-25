import { Button } from './ui/button'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Loader2, X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const createTagSchema = z.object({
    title: z.string().min(3, { message: 'Minimun 3 caracters.' }),
})

type CreateTagSchema = z.infer<typeof createTagSchema>;

export function CreateTagForm() {
    const queryClient = useQueryClient()

    const { register, handleSubmit, watch, formState } = useForm<CreateTagSchema>(
        {
            resolver: zodResolver(createTagSchema),
        }
    )

    function getSlugFromString(input: string) {
        return input
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '-')
    }

    const slug = watch('title') ? getSlugFromString(watch('title')) : ''

    const { mutateAsync } = useMutation({
        mutationFn: async ({ title }: CreateTagSchema) => {
            await fetch('http://localhost:3333/tags', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    slug,
                    amountOfVideos: 0,
                }),
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['get-tags'],
            })
        },
    })

    async function createTag({ title }: CreateTagSchema) {
        mutateAsync({ title })
    }

    return (
        <form className="w-full space-y-6" onSubmit={handleSubmit(createTag)}>
            <div className="space-y-2">
                <label className="text-sm font-medium block" htmlFor="title">
          Tag name
                </label>
                <input
                    type="text"
                    id="title"
                    className="border border-zinc-800 rounded-lg px-3 py-2.5 bg-zinc-800/50 w-full text-sm"
                    {...register('title')}
                />
                {formState.errors?.title && (
                    <p className="text-sm text-red-400">
                        {formState.errors.title.message}
                    </p>
                )}
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium block" htmlFor="slug">
          Slug
                </label>
                <input
                    type="text"
                    readOnly
                    id="slug"
                    value={slug}
                    className="border border-zinc-800 rounded-lg px-3 py-2.5 bg-zinc-800/50 w-full text-sm"
                />
            </div>

            <div className="flex items-center justify-end gap-2">
                <Dialog.Close asChild>
                    <Button>
                        <X className="size-3" />
            Cancel
                    </Button>
                </Dialog.Close>
                <Button
                    type="submit"
                    className="bg-teal-400 text-teal-950"
                    disabled={formState.isSubmitting}
                >
                    {formState.isSubmitting ? (
                        <Loader2 className="size-3 animate-spin" />
                    ) : (
                        <Check className="size-3" />
                    )}
          Save
                </Button>
            </div>
        </form>
    )
}

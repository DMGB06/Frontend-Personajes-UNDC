<script setup lang="ts">
const config = useRuntimeConfig()
const baseURL = useCookie("BASE_URL");
baseURL.value = config.public.baseURL

</script>
<template>
	<div>
		<VApp>
			<VMain>
				<slot />
			</VMain>
		</VApp>
	</div>
</template>
